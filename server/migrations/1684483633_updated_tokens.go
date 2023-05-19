package migrations

import (
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/daos"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	m.Register(func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("zjulwnkxemfb9i2")
		if err != nil {
			return err
		}

		collection.ListRule = types.Pointer("owner.id = @request.auth.id")

		collection.ViewRule = types.Pointer("owner.id = @request.auth.id")

		collection.CreateRule = types.Pointer("owner.id = @request.auth.id")

		collection.UpdateRule = types.Pointer("owner.id = @request.auth.id")

		return dao.SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("zjulwnkxemfb9i2")
		if err != nil {
			return err
		}

		collection.ListRule = nil

		collection.ViewRule = nil

		collection.CreateRule = nil

		collection.UpdateRule = nil

		return dao.SaveCollection(collection)
	})
}
