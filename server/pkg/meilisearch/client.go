package meilisearch

import (
	"github.com/meilisearch/meilisearch-go"
)

func NewClient(host, apiKey string) *meilisearch.Client {
	return meilisearch.NewClient(meilisearch.ClientConfig{
		Host:   host,
		APIKey: apiKey,
	})
}
