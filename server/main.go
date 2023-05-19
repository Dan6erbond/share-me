package main

import (
	"log"
	"os"

	_ "github.com/joho/godotenv/autoload"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"

	_ "github.com/Dan6erbond/share-me/migrations"
	"github.com/Dan6erbond/share-me/pkg/apis"
	"github.com/Dan6erbond/share-me/pkg/keys"
	"github.com/Dan6erbond/share-me/pkg/meilisearch"
	"github.com/Dan6erbond/share-me/pkg/tags"
)

func main() {
	app := pocketbase.New()

	migratecmd.MustRegister(app, app.RootCmd, &migratecmd.Options{
		Automigrate: true, // auto creates migration files when making collection changes
	})

	if os.Getenv("MEILISEARCH_HOST") != "" && os.Getenv("MEILISEARCH_ADMIN_API_KEY") != "" {
		app.Settings()
		client := meilisearch.NewClient(os.Getenv("MEILISEARCH_HOST"), os.Getenv("MEILISEARCH_ADMIN_API_KEY"))
		key, _ := meilisearch.GetReadOnlyKey(client)
		if key != "" {
			app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
				if app.IsDebug() {
					log.Println("MeiliSearch configured")
				}
				log.Println("MeiliSearch read-only key:", key)
				return nil
			})
		}
		meilisearch.RegisterCommands(app, client)
		meilisearch.RegisterHooks(app, client)
	}

	app.OnRecordAfterDeleteRequest("posts", "delete").Add(func(e *core.RecordDeleteEvent) error {
		if e.Record.Collection().Name != "posts" {
			return nil
		}

		files, _ := app.Dao().FindRecordsByIds("files", e.Record.GetStringSlice("files"))

		for _, f := range files {
			_ = app.Dao().DeleteRecord(f)
		}

		return nil
	})

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		err := keys.RegisterMiddleware(e)

		if err != nil {
			return err
		}

		err = keys.RegisterRoutes(e)

		if err != nil {
			return err
		}

		err = apis.RegisterFileRoutes(e)

		return err
	})

	if os.Getenv("TAGGER_HOST") != "" {
		tags.RegisterCommands(app, os.Getenv("TAGGER_HOST"))
		tags.RegisterHooks(app, os.Getenv("TAGGER_HOST"))
	}

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
