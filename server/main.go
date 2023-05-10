package main

import (
	"log"
	"os"

	_ "github.com/joho/godotenv/autoload"
	"github.com/meilisearch/meilisearch-go"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"github.com/spf13/cobra"

	// uncomment once you have at least one .go migration file in the "migrations" directory
	_ "github.com/Dan6erbond/share-me/migrations"
)

func main() {
	app := pocketbase.New()

	migratecmd.MustRegister(app, app.RootCmd, &migratecmd.Options{
		Automigrate: true, // auto creates migration files when making collection changes
	})

	client := meilisearch.NewClient(meilisearch.ClientConfig{
		Host:   os.Getenv("MEILISEARCH_HOST"),
		APIKey: os.Getenv("MEILISEARCH_ADMIN_API_KEY"),
	})

	getPostDocument := func(post *models.Record) (map[string]interface{}, error) {
		author, _ := app.Dao().FindRecordById("users", post.GetString("author"))

		files, _ := app.Dao().FindRecordsByIds("files", post.GetStringSlice("files"))
		var fileDocuments []map[string]interface{}

		for _, f := range files {
			fileDocuments = append(fileDocuments, map[string]interface{}{
				"id":          f.GetString("id"),
				"name":        f.GetString("name"),
				"description": f.GetString("description"),
			})
		}

		return map[string]interface{}{
			"id":     post.Id,
			"title":  post.GetString("title"),
			"author": author.GetString("username"),
			"files":  fileDocuments,
		}, nil
	}

	indexCmd := &cobra.Command{
		Use: "index",
		Run: func(command *cobra.Command, args []string) {
			print("Runs commands to interact with the Meilisearch index")
		},
	}

	indexCmd.AddCommand(&cobra.Command{
		Use: "clear",
		Run: func(command *cobra.Command, args []string) {
			_, _ = client.Index("posts").DeleteAllDocuments()
		},
	})

	indexCmd.AddCommand(&cobra.Command{
		Use: "sync",
		Run: func(command *cobra.Command, args []string) {
			posts, _ := app.Dao().FindRecordsByExpr("posts")
			var documents []map[string]interface{}
			for _, p := range posts {
				if !p.GetBool("public") {
					continue
				}

				postDocument, _ := getPostDocument(p)
				documents = append(documents, postDocument)
			}
			_, _ = client.Index("posts").AddDocuments(documents)
		},
	})

	app.RootCmd.AddCommand(indexCmd)

	app.OnRecordAfterCreateRequest().Add(func(e *core.RecordCreateEvent) error {
		switch e.Record.Collection().Name {
		case "posts":
			if !e.Record.GetBool("public") {
				return nil
			}
			postDocument, _ := getPostDocument(e.Record)
			_, _ = client.Index("posts").AddDocuments([]map[string]interface{}{postDocument})
		case "files":
			post, _ := app.Dao().FindRecordsByExpr("posts", dbx.NewExp("{:file} IN files", dbx.Params{"file": e.Record.Id}))
			if len(post) == 0 || !post[0].GetBool("public") {
				return nil
			}
			postDocument, _ := getPostDocument(post[0])
			_, _ = client.Index("posts").AddDocuments([]map[string]interface{}{postDocument})
		}
		return nil
	})

	app.OnRecordAfterUpdateRequest().Add(func(e *core.RecordUpdateEvent) error {
		switch e.Record.Collection().Name {
		case "posts":
			if !e.Record.GetBool("public") {
				return nil
			}
			postDocument, _ := getPostDocument(e.Record)
			_, _ = client.Index("posts").AddDocuments([]map[string]interface{}{postDocument})
		case "files":
			post, _ := app.Dao().FindRecordsByExpr("posts", dbx.NewExp("{:file} IN files", dbx.Params{"file": e.Record.Id}))
			if len(post) == 0 || !post[0].GetBool("public") {
				return nil
			}
			postDocument, _ := getPostDocument(post[0])
			_, _ = client.Index("posts").AddDocuments([]map[string]interface{}{postDocument})
		}
		return nil
	})

	app.OnRecordAfterDeleteRequest().Add(func(e *core.RecordDeleteEvent) error {
		switch e.Record.Collection().Name {
		case "posts":
			client.Index("posts").DeleteDocument(e.Record.Id)
		case "files":
			post, _ := app.Dao().FindRecordsByExpr("posts", dbx.NewExp("{:file} IN files", dbx.Params{"file": e.Record.Id}))
			if len(post) == 0 || !post[0].GetBool("public") {
				return nil
			}
			postDocument, _ := getPostDocument(post[0])
			_, _ = client.Index("posts").AddDocuments([]map[string]interface{}{postDocument})
		}
		return nil
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
