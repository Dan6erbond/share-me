FROM golang:1.19 as builder

ENV CGO_ENABLED=0

WORKDIR /pb

COPY go.mod ./
COPY go.sum ./

RUN go mod download

COPY ./ ./

RUN GOOS=linux go build -o /pb/pocketbase

EXPOSE 8080

CMD [ "./entrypoint.sh" ]
