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

func RegisterMiddleware(e *core.ServeEvent) error {
	e.Router.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			token := c.Request().Header.Get("Authorization")
			if token == "" {
				return next(c)
			}

			// the schema is not required and it is only for
			// compatibility with the defaults of some HTTP clients
			token = strings.TrimPrefix(token, "Bearer ")

			claims, _ := security.ParseUnverifiedJWT(token)

			if dbId, ok := claims["dbId"]; ok {
				tokenId := cast.ToString(dbId)

				token, err := e.App.Dao().FindRecordById("tokens", tokenId)

				if err != nil {
					return apis.NewUnauthorizedError("The request requires valid record authorization token to be set.", nil)
				}

				if token.GetBool("revoked") {
					return apis.NewUnauthorizedError("The request requires valid record authorization token to be set.", nil)
				}

				if !token.GetDateTime("expires").IsZero() && token.GetDateTime("expires").Time().Before(time.Now()) {
					return apis.NewUnauthorizedError("The request requires valid record authorization token to be set.", nil)
				}
			}

			next(c)
			return nil
		}
	})

	return nil
}
