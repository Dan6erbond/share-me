package tags

import (
	"log"
	"net/http"
	"net/url"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

func RegisterHooks(app *pocketbase.PocketBase, taggerHost string) {
	app.OnRecordBeforeCreateRequest("files/posts", "create", "defaults").Add(func(e *core.RecordCreateEvent) error {
		if e.Record.Collection().Name == "files" {
			e.Record.Set("tags", "[]")
			e.Record.Set("tagsSuggestions", "[]")

			return nil
		}

		if e.Record.Collection().Name == "posts" {
			e.Record.Set("tags", "[]")

			return nil
		}

		return nil
	})

	app.OnRecordAfterCreateRequest("files", "create", "tag").Add(func(e *core.RecordCreateEvent) error {
		if e.Record.Collection().Name != "files" {
			return nil
		}

		var isImageType bool
		for _, t := range imageMimeTypes {
			if e.Record.GetString("type") == t {
				isImageType = true
				continue
			}
		}

		if !isImageType {
			return nil
		}

		url, err := url.Parse(taggerHost)

		if err != nil {
			log.Println(err)
			return err
		}

		url.Path = "files/" + e.Record.Id

		resp, err := http.Post(url.String(), "application/json", nil)

		if err != nil {
			log.Println(err)
			return err
		}

		defer resp.Body.Close()

		return nil
	})
}
