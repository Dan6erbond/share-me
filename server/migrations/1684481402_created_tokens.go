package migrations

import (
	"encoding/json"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/daos"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/models"
)

func init() {
	m.Register(func(db dbx.Builder) error {
		jsonData := `{
			"id": "zjulwnkxemfb9i2",
			"created": "2023-05-19 07:30:02.938Z",
			"updated": "2023-05-19 07:30:02.938Z",
			"name": "tokens",
			"type": "base",
			"system": false,
			"schema": [
				{
					"system": false,
					"id": "i3ctfv03",
					"name": "revoked",
					"type": "bool",
					"required": false,
					"unique": false,
					"options": {}
				},
				{
					"system": false,
					"id": "u7i4ai5e",
					"name": "expires",
					"type": "date",
					"required": false,
					"unique": false,
					"options": {
						"min": "",
						"max": ""
					}
				}
			],
			"indexes": [],
			"listRule": null,
			"viewRule": null,
			"createRule": null,
			"updateRule": null,
			"deleteRule": null,
			"options": {}
		}`

		collection := &models.Collection{}
		if err := json.Unmarshal([]byte(jsonData), &collection); err != nil {
			return err
		}

		return daos.New(db).SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("zjulwnkxemfb9i2")
		if err != nil {
			return err
		}

		return dao.DeleteCollection(collection)
	})
}
