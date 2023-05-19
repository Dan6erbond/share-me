package keys

import (
	"strings"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/security"
	"github.com/spf13/cast"
)

func VerifyKey(app core.App) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			token := c.Request().Header.Get("Authorization")
			if token == "" {
				return next(c)
			}

			token = strings.TrimPrefix(token, "Bearer ")

			claims, _ := security.ParseUnverifiedJWT(token)

			if dbId, ok := claims["dbId"]; ok {
				tokenId := cast.ToString(dbId)

				dbToken, err := app.Dao().FindRecordById("tokens", tokenId)

				if err != nil {
					return apis.NewUnauthorizedError("The request requires valid record authorization token to be set.", nil)
				}

				if dbToken.GetBool("revoked") {
					return apis.NewUnauthorizedError("The request requires valid record authorization token to be set.", nil)
				}

				if !dbToken.GetDateTime("expires").IsZero() && dbToken.GetDateTime("expires").Time().Before(time.Now()) {
					return apis.NewUnauthorizedError("The request requires valid record authorization token to be set.", nil)
				}
			}

			return next(c)
		}
	}
}

func RegisterMiddleware(e *core.ServeEvent) error {
	e.Router.Use(VerifyKey(e.App))

	return nil
}
