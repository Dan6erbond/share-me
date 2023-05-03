FROM golang:1.18 as builder

WORKDIR /pb

COPY go.mod ./
COPY go.sum ./

RUN go mod download

COPY ./ ./

RUN go build -o ./pocketbase

EXPOSE 8080

CMD [ "./entrypoint.sh" ]
