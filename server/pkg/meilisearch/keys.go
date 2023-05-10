package meilisearch

import "github.com/meilisearch/meilisearch-go"

func GetReadOnlyKey(client *meilisearch.Client) (string, error) {
	keys, err := client.GetKeys(&meilisearch.KeysQuery{})

	if err != nil {
		return "", err
	}

	for _, key := range keys.Results {
		if len(key.Actions) == 1 && key.Actions[0] == "search" {
			return key.Key, nil
		}
	}

	return "", nil
}
