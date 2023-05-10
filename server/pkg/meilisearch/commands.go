package meilisearch

import (
	"github.com/meilisearch/meilisearch-go"
	"github.com/pocketbase/pocketbase"
	"github.com/spf13/cobra"
)

func RegisterCommands(app *pocketbase.PocketBase, client *meilisearch.Client) {
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
			posts, err := app.Dao().FindRecordsByExpr("posts")

			if err != nil {
				panic(err)
			}

			var documents []map[string]interface{}
			for _, p := range posts {
				if !p.GetBool("public") {
					continue
				}

				postDocument, _ := getPostDocument(app, p)
				documents = append(documents, postDocument)
			}
			_, err = client.Index("posts").AddDocuments(documents)

			if err != nil {
				panic(err)
			}
		},
	})

	app.RootCmd.AddCommand(indexCmd)
}
