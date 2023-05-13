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

		collection, err := dao.FindCollectionByNameOrId("files")
		if err != nil {
			return err
		}

		// add
		new_tags_suggestions := &schema.SchemaField{}
		json.Unmarshal([]byte(`{
			"system": false,
			"id": "ru9qxba4",
			"name": "tagsSuggestions",
			"type": "json",
			"required": false,
			"unique": false,
			"options": {}
		}`), new_tags_suggestions)
		collection.Schema.AddField(new_tags_suggestions)

		return dao.SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("files")
		if err != nil {
			return err
		}

		// remove
		collection.Schema.RemoveField("ru9qxba4")

		return dao.SaveCollection(collection)
	})
}
