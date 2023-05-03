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

		usersCollection.ViewRule = types.Pointer("")
		usersCollection.ListRule = types.Pointer("")

		err = daos.New(db).SaveCollection(usersCollection)

		if err != nil {
			return err
		}

		filesCollection, err := daos.New(db).FindCollectionByNameOrId("files")

		if err != nil {
			return err
		}

		filesCollection.ViewRule = types.Pointer("")
		filesCollection.ListRule = types.Pointer("")

		err = daos.New(db).SaveCollection(filesCollection)

		if err != nil {
			return err
		}

		postsCollection, err := daos.New(db).FindCollectionByNameOrId("posts")

		if err != nil {
			return err
		}

		postsCollection.ViewRule = types.Pointer("@request.auth.id = author.id || public = true")

		err = daos.New(db).SaveCollection(postsCollection)

		if err != nil {
			return err
		}

		return nil
	}, func(db dbx.Builder) error {
		// add down queries...

		return nil
	})
}
