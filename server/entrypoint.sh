#! /bin/sh
./pocketbase migrate up
./pocketbase serve --http=0.0.0.0:8080
