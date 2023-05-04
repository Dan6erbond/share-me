package migrations

import (
	"encoding/json"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/daos"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/models/schema"
)

func init() {
	m.Register(func(db dbx.Builder) error {
		dao := daos.New(db)

		collection, err := dao.FindCollectionByNameOrId("files")
		if err != nil {
			return err
		}

		for _, f := range collection.Schema.Fields() {
			if f.Name == "file" {
				f.Options = &schema.FileOptions{
					MaxSelect: 1,
					MaxSize:   5242880,
					MimeTypes: []string{
						"image/jpeg",
						"image/png",
						"image/svg+xml",
						"image/gif",
						"image/webp",
						"video/mp4",
					},
					Thumbs: []string{"1200x630"},
				}
			}
		}

		return dao.SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db)

		collection, err := dao.FindCollectionByNameOrId("files")
		if err != nil {
			return err
		}

		// update
		edit_file := &schema.SchemaField{}
		json.Unmarshal([]byte(`{
			"system": false,
			"id": "zybfkrpp",
			"name": "file",
			"type": "file",
			"required": false,
			"unique": false,
			"options": {
				"maxSelect": 1,
				"maxSize": 10737418240,
				"mimeTypes": [
					"image/jpeg",
					"image/png",
					"image/svg+xml",
					"image/gif",
					"image/webp",
					"video/mp4"
				],
				"thumbs": null,
				"protected": false
			}
		}`), edit_file)
		collection.Schema.AddField(edit_file)

		return dao.SaveCollection(collection)
	})
}
