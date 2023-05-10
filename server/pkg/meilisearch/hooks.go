package meilisearch

import (
	"github.com/meilisearch/meilisearch-go"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

func RegisterHooks(app *pocketbase.PocketBase, client *meilisearch.Client) {
	app.OnRecordAfterCreateRequest().Add(func(e *core.RecordCreateEvent) error {
		switch e.Record.Collection().Name {
		case "posts":
			if !e.Record.GetBool("public") {
				return nil
			}
			postDocument, _ := getPostDocument(app, e.Record)
			_, _ = client.Index("posts").AddDocuments([]map[string]interface{}{postDocument})
		case "files":
			post, _ := app.Dao().FindRecordsByExpr("posts", dbx.NewExp("{:file} IN files", dbx.Params{"file": e.Record.Id}))
			if len(post) == 0 || !post[0].GetBool("public") {
				return nil
			}
			postDocument, _ := getPostDocument(app, post[0])
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
			postDocument, _ := getPostDocument(app, e.Record)
			_, _ = client.Index("posts").AddDocuments([]map[string]interface{}{postDocument})
		case "files":
			post, _ := app.Dao().FindRecordsByExpr("posts", dbx.NewExp("{:file} IN files", dbx.Params{"file": e.Record.Id}))
			if len(post) == 0 || !post[0].GetBool("public") {
				return nil
			}
			postDocument, _ := getPostDocument(app, post[0])
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
			postDocument, _ := getPostDocument(app, post[0])
			_, _ = client.Index("posts").AddDocuments([]map[string]interface{}{postDocument})
		}
		return nil
	})
}
