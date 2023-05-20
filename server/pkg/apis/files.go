package apis

import (
	"mime"
	"mime/multipart"
	"net/http"
	"path/filepath"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/forms"
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/tools/filesystem"
)

const ApplicationOctetStream = "application/octet-stream"

func newFile(app core.App, files *models.Collection, author *models.Record, file *multipart.FileHeader) (*models.Record, error) {
	f, err := filesystem.NewFileFromMultipart(file)

	var contentType string

	if ct := file.Header.Get("Content-Type"); ct != "" {
		contentType = ct
	}

	// Guess content-type from extension if missing
	if contentType == "" || contentType == ApplicationOctetStream {
		if ext := filepath.Ext(file.Filename); ext != "" {
			contentType = mime.TypeByExtension(ext)
		}
	}

	if contentType == "" {
		contentType = ApplicationOctetStream
	}

	if err != nil {
		return nil, apis.NewApiError(http.StatusInternalServerError, "", err)
	}

	fileModel := models.NewRecord(files)

	form := forms.NewRecordUpsert(app, fileModel)
	form.LoadData(map[string]any{
		"title":           f.OriginalName,
		"author":          author.Id,
		"tags":            "[]",
		"tagsSuggestions": "[]",
		"type":            contentType,
	})
	form.AddFiles("file", f)

	if err := form.Submit(); err != nil {
		return nil, apis.NewApiError(http.StatusInternalServerError, "", err)
	}

	return fileModel, nil
}

func RegisterFileRoutes(e *core.ServeEvent) error {
	_, err := e.Router.AddRoute(echo.Route{
		Method: http.MethodPost,
		Path:   "/api/posts",
		Handler: func(c echo.Context) error {
			record, _ := c.Get(apis.ContextAuthRecordKey).(*models.Record)

			posts, err := e.App.Dao().FindCollectionByNameOrId("posts")

			if err != nil {
				return apis.NewApiError(http.StatusInternalServerError, "", err)
			}

			files, err := e.App.Dao().FindCollectionByNameOrId("files")

			if err != nil {
				return apis.NewApiError(http.StatusInternalServerError, "", err)
			}

			var fileIds []string

			ff, err := c.FormFile("file")

			if ff != nil && err != nil {
				file, err := newFile(e.App, files, record, ff)

				if err != nil {
					return apis.NewApiError(http.StatusInternalServerError, "", err)
				}

				fileIds = append(fileIds, file.Id)
			} else {
				form, err := c.MultipartForm()
				if err != nil {
					return err
				}

				formFiles, ok := form.File["files"]

				if !ok {
					return apis.NewApiError(http.StatusBadRequest, "Either the file or files form body must be set.", nil)
				}

				for _, f := range formFiles {
					file, err := newFile(e.App, files, record, f)

					if err != nil {
						return apis.NewApiError(http.StatusInternalServerError, "", err)
					}

					fileIds = append(fileIds, file.Id)
				}
			}

			post := models.NewRecord(posts)
			post.Set("title", "")
			post.Set("public", false)
			post.Set("nsfw", false)
			post.Set("author", record.Id)
			post.Set("files", fileIds)

			e.App.Dao().SaveRecord(post)

			postJson, err := post.MarshalJSON()

			if err != nil {
				return apis.NewApiError(http.StatusInternalServerError, "", err)
			}

			return c.JSONBlob(http.StatusOK, postJson)
		},
		Middlewares: []echo.MiddlewareFunc{
			apis.ActivityLogger(e.App),
			apis.RequireRecordAuth(),
		},
	})

	return err
}
