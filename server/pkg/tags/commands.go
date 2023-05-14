package tags

import (
	"log"
	"net/http"
	"net/url"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/tools/types"
	"github.com/spf13/cobra"
)

func RegisterCommands(app *pocketbase.PocketBase, taggerHost string) {
	tagsCmd := &cobra.Command{
		Use: "tags",
		Run: func(command *cobra.Command, args []string) {
			print("Runs commands to interact with the tagger")
		},
	}

	tagsCmd.AddCommand(&cobra.Command{
		Use: "generate",
		Run: func(command *cobra.Command, args []string) {
			files, err := app.Dao().FindRecordsByExpr("files")

			if err != nil {
				log.Println(err)
			}

			for _, file := range files {
				if file.Get("tagsSuggestions").(types.JsonRaw).String() != "" {
					continue
				}

				url, err := url.Parse(taggerHost)

				if err != nil {
					log.Println(err)
				}

				url.Path = "files/" + file.Id

				resp, err := http.Post(url.String(), "application/json", nil)

				if err != nil {
					log.Println(err)
					continue
				}

				defer resp.Body.Close()
			}
		},
	})

	app.RootCmd.AddCommand(tagsCmd)
}
