package main

import (
	"log"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"

	// uncomment once you have at least one .go migration file in the "migrations" directory
	_ "github.com/Dan6erbond/share-me/migrations"
)

func main() {
	app := pocketbase.New()

	migratecmd.MustRegister(app, app.RootCmd, &migratecmd.Options{
		Automigrate: true, // auto creates migration files when making collection changes
	})

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

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
