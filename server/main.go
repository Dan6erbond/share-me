package main

import (
	"log"
	"net/http"
	"net/url"
	"os"

	_ "github.com/joho/godotenv/autoload"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"

	// uncomment once you have at least one .go migration file in the "migrations" directory
	_ "github.com/Dan6erbond/share-me/migrations"
	"github.com/Dan6erbond/share-me/pkg/meilisearch"
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

	app.OnRecordBeforeCreateRequest("files/posts", "create", "defaults").Add(func(e *core.RecordCreateEvent) error {
		if e.Record.Collection().Name == "files" {
			e.Record.Set("tags", "[]")
			e.Record.Set("tagsSuggestions", "[]")

			return nil
		}

		if e.Record.Collection().Name == "posts" {
			e.Record.Set("tags", "[]")

			return nil
		}

		return nil
	})

	if os.Getenv("TAGGER_HOST") != "" {
		app.OnRecordAfterCreateRequest("files", "create", "tag").Add(func(e *core.RecordCreateEvent) error {
			if e.Record.Collection().Name != "files" {
				return nil
			}

			url, err := url.Parse(os.Getenv("TAGGER_HOST"))

			if err != nil {
				log.Println(err)
				return err
			}

			url.Path = "files/" + e.Record.Id

			resp, err := http.Post(url.String(), "application/json", nil)
			resp.Body.Close()

			if err != nil {
				log.Println(err)
				return err
			}

			return err
		})
	}

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
