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

		collection, err := dao.FindCollectionByNameOrId("zjulwnkxemfb9i2")
		if err != nil {
			return err
		}

		// add
		new_owner := &schema.SchemaField{}
		json.Unmarshal([]byte(`{
			"system": false,
			"id": "qdmthnb4",
			"name": "owner",
			"type": "relation",
			"required": false,
			"unique": false,
			"options": {
				"collectionId": "_pb_users_auth_",
				"cascadeDelete": false,
				"minSelect": null,
				"maxSelect": 1,
				"displayFields": []
			}
		}`), new_owner)
		collection.Schema.AddField(new_owner)

		return dao.SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("zjulwnkxemfb9i2")
		if err != nil {
			return err
		}

		// remove
		collection.Schema.RemoveField("qdmthnb4")

		return dao.SaveCollection(collection)
	})
}
