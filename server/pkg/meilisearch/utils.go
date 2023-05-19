package meilisearch

import (
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/models"
)

func getPostDocument(app *pocketbase.PocketBase, post *models.Record) (map[string]interface{}, error) {
	author, err := app.Dao().FindRecordById("users", post.GetString("author"))

	if err != nil {
		return nil, err
	}

	files, err := app.Dao().FindRecordsByIds("files", post.GetStringSlice("files"))

	if err != nil {
		return nil, err
	}

	var fileDocuments []map[string]interface{}

	for _, f := range files {
		fileDocuments = append(fileDocuments, map[string]interface{}{
			"id":              f.GetString("id"),
			"name":            f.GetString("name"),
			"description":     f.GetString("description"),
			"tagsSuggestions": f.GetString("tagsSuggestions"),
		})
	}

	return map[string]interface{}{
		"id":     post.Id,
		"title":  post.GetString("title"),
		"author": author.GetString("username"),
		"files":  fileDocuments,
		"tags":   post.Get("tags"),
	}, nil
}
