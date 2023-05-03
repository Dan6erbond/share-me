package migrations

import (
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/daos"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/models/schema"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	m.Register(func(db dbx.Builder) error {
		usersCollection, err := daos.New(db).FindCollectionByNameOrId("users")

		if err != nil {
			return err
		}

		filesCollection := &models.Collection{
			Name:       "files",
			Type:       models.CollectionTypeBase,
			ViewRule:   nil,
			ListRule:   nil,
			CreateRule: nil,
			UpdateRule: types.Pointer("@request.auth.id = author.id"),
			DeleteRule: types.Pointer("@request.auth.id = author.id"),
			Schema: schema.NewSchema(
				&schema.SchemaField{
					Type:    schema.FieldTypeText,
					Name:    "name",
					Options: &schema.TextOptions{},
				},
				&schema.SchemaField{
					Type:    schema.FieldTypeText,
					Name:    "description",
					Options: &schema.TextOptions{},
				},
				&schema.SchemaField{
					Type: schema.FieldTypeRelation,
					Name: "author",
					Options: &schema.RelationOptions{
						MaxSelect:    types.Pointer(1),
						CollectionId: usersCollection.Id,
					},
				},
				&schema.SchemaField{
					Type:    schema.FieldTypeText,
					Name:    "type",
					Options: &schema.TextOptions{},
				},
				&schema.SchemaField{
					Type: schema.FieldTypeFile,
					Name: "file",
					Options: &schema.FileOptions{
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
					},
				},
			),
		}

		err = daos.New(db).SaveCollection(filesCollection)

		if err != nil {
			return err
		}

		postsCollection := &models.Collection{
			Name:       "posts",
			Type:       models.CollectionTypeBase,
			ViewRule:   nil,
			ListRule:   types.Pointer("@request.auth.id = author.id || public = true"),
			CreateRule: nil,
			UpdateRule: types.Pointer("@request.auth.id = author.id"),
			DeleteRule: types.Pointer("@request.auth.id = author.id"),
			Schema: schema.NewSchema(
				&schema.SchemaField{
					Type:    schema.FieldTypeText,
					Name:    "title",
					Options: &schema.TextOptions{},
				},
				&schema.SchemaField{
					Type: schema.FieldTypeRelation,
					Name: "author",
					Options: &schema.RelationOptions{
						MaxSelect:    types.Pointer(1),
						CollectionId: usersCollection.Id,
					},
				},
				&schema.SchemaField{
					Type: schema.FieldTypeRelation,
					Name: "files",
					Options: &schema.RelationOptions{
						CollectionId: filesCollection.Id,
					},
				},
				&schema.SchemaField{
					Type: schema.FieldTypeBool,
					Name: "public",
				},
				&schema.SchemaField{
					Type: schema.FieldTypeBool,
					Name: "nsfw",
				},
			),
		}

		err = daos.New(db).SaveCollection(postsCollection)

		if err != nil {
			return err
		}

		return nil
	}, func(db dbx.Builder) error {
		collection, err := daos.New(db).FindCollectionByNameOrId("posts")

		if err != nil {
			return err
		}

		err = daos.New(db).DeleteCollection(collection)

		if err != nil {
			return err
		}

		collection, err = daos.New(db).FindCollectionByNameOrId("files")

		if err != nil {
			return err
		}

		err = daos.New(db).DeleteCollection(collection)

		if err != nil {
			return err
		}

		return nil
	})
}
