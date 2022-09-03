FROM golang:latest

ADD ./rules /rules

ADD ./*.sh /

WORKDIR /rules

RUN go build -o battlesnake ./cli/battlesnake/main.go