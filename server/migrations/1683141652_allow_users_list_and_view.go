package migrations

import (
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/daos"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	m.Register(func(db dbx.Builder) error {
		usersCollection, err := daos.New(db).FindCollectionByNameOrId("users")

		if err != nil {
			return err
		}

		usersCollection.ViewRule = nil
		usersCollection.ListRule = nil

		return daos.New(db).SaveCollection(usersCollection)
	}, func(db dbx.Builder) error {
		usersCollection, err := daos.New(db).FindCollectionByNameOrId("users")

		if err != nil {
			return err
		}

		usersCollection.ViewRule = types.Pointer("id = @request.auth.id")
		usersCollection.ListRule = types.Pointer("id = @request.auth.id")

		return daos.New(db).SaveCollection(usersCollection)
	})
}
