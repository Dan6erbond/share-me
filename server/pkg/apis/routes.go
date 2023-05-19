package apis

import (
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/forms"
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/tools/filesystem"
)

func RegisterRoutes(e *core.ServeEvent) error {
	e.Router.AddRoute(echo.Route{
		Method: http.MethodPost,
		Path:   "/api/posts",
		Handler: func(c echo.Context) error {
			record, _ := c.Get(apis.ContextAuthRecordKey).(*models.Record)

			if record == nil {
				return apis.NewNotFoundError("Missing auth record context.", nil)
			}

			posts, err := e.App.Dao().FindCollectionByNameOrId("posts")

			if err != nil {
				return apis.NewApiError(http.StatusInternalServerError, "", err)
			}

			files, err := e.App.Dao().FindCollectionByNameOrId("files")

			if err != nil {
				return apis.NewApiError(http.StatusInternalServerError, "", err)
			}

			ff, err := c.FormFile("file")

			if err != nil {
				return apis.NewApiError(http.StatusInternalServerError, "", err)
			}

			f, err := filesystem.NewFileFromMultipart(ff)

			if err != nil {
				return apis.NewApiError(http.StatusInternalServerError, "", err)
			}

			file := models.NewRecord(files)

			form := forms.NewRecordUpsert(e.App, file)
			form.LoadData(map[string]any{
				"title":           f.OriginalName,
				"author":          record.Id,
				"tags":            "[]",
				"tagsSuggestions": "[]",
			})
			form.AddFiles("file", f)

			if err := form.Submit(); err != nil {
				return apis.NewApiError(http.StatusInternalServerError, "", err)
			}

			post := models.NewRecord(posts)
			post.Set("title", "")
			post.Set("public", false)
			post.Set("nsfw", false)
			post.Set("author", record.Id)
			post.Set("files", []string{file.Id})

			e.App.Dao().SaveRecord(post)

			return c.JSON(http.StatusOK, map[string]interface{}{
				"post": post,
			})
		},
		Middlewares: []echo.MiddlewareFunc{
			apis.ActivityLogger(e.App),
			apis.RequireRecordAuth(),
		},
	})

	return nil
}
