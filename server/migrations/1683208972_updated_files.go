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
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("vnfvpvktvaivqe2")
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
				"thumbs": [
					"1200x630"
				],
				"protected": false
			}
		}`), edit_file)
		collection.Schema.AddField(edit_file)

		return dao.SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("vnfvpvktvaivqe2")
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
