package keys

import (
	"net/http"

	"github.com/golang-jwt/jwt/v4"
	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/tokens"
)

func RegisterRoutes(e *core.ServeEvent) error {
	e.Router.AddRoute(echo.Route{
		Method: http.MethodPost,
		Path:   "/api/keys",
		Handler: func(c echo.Context) error {
			record, _ := c.Get(apis.ContextAuthRecordKey).(*models.Record)

			tokensCollection, err := e.App.Dao().FindCollectionByNameOrId("tokens")

			if err != nil {
				return apis.NewApiError(http.StatusInternalServerError, "", err)
			}

			tokenModel := models.NewRecord(tokensCollection)
			tokenModel.Set("owner", record.Id)

			if err := e.App.Dao().SaveRecord(tokenModel); err != nil {
				return apis.NewApiError(http.StatusInternalServerError, "", err)
			}

			claims := jwt.MapClaims{
				"id":           record.Id,
				"type":         tokens.TypeAuthRecord,
				"collectionId": record.Collection().Id,
				"dbId":         tokenModel.Id,
			}

			token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(e.App.Settings().RecordAuthToken.Secret))

			if err != nil {
				return apis.NewApiError(http.StatusInternalServerError, "", err)
			}

			return c.JSON(http.StatusOK, map[string]interface{}{
				"token": token,
			})
		},
		Middlewares: []echo.MiddlewareFunc{
			apis.ActivityLogger(e.App),
			apis.RequireRecordAuth(),
		},
	})

	return nil
}
