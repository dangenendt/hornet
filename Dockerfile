# ---[ build image ]---
FROM golang:1.13 as builder

WORKDIR /go/src/github.com/gohornet/hornet
ADD . .
RUN CGO_ENABLED=0 GOOS=linux go build -o ./hornet main.go

# ---[ runtime image ]---
FROM alpine:latest
WORKDIR /app

ARG ARCH=amd64
ENV TARGET_ARCH=${ARCH:+-$ARCH} \
    TINI_VERSION=v0.18.0

# Tini is excellent: https://github.com/krallin/tini#why-tini
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-static${TARGET_ARCH} /tini
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-static${TARGET_ARCH}.asc /tini.asc

COPY --from=builder ["/go/src/github.com/gohornet/hornet/hornet", "/go/src/github.com/gohornet/hornet/config.json", "/go/src/github.com/gohornet/hornet/neighbors.json", "/app/"]
RUN apk --no-cache add ca-certificates gnupg\
 && addgroup --gid 39999 hornet\
 && adduser -h /app -s /bin/sh -G hornet -u 39999 -D hornet\
 && chmod +x /tini /app/hornet\
 && chown hornet:hornet -R /app\
 && for server in $(shuf -e ha.pool.sks-keyservers.net \
                            hkp://p80.pool.sks-keyservers.net:80 \
                            keyserver.ubuntu.com \
                            hkp://keyserver.ubuntu.com:80 \
                            keyserver.pgp.com \
                            pgp.mit.edu); do \
         timeout -s 15 5 gpg --keyserver "$server" --recv-keys 595E85A6B1B4779EA4DAAEC70B588DFF0527A9B7 && break || : ; \
    done; \
 gpg --batch --verify /tini.asc /tini

# Not exposing ports, as it might be more efficient to run this on host network because of performance gain.
# | Host mode networking can be useful to optimize performance, and in situations where a container needs
# | to handle a large range of ports, as it does not require network address translation (NAT), and no
# | “userland-proxy” is created for each port.
# Source: https://docs.docker.com/network/host/

USER hornet
ENTRYPOINT ["/tini", "--", "/app/hornet"]
