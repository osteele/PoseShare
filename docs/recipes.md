# Recipes

## Run in development mode

```shell
yarn dev
```

Run the server in development mode. `nodemon` restarts the server when any file
in `server/` changes; the server tells the client to reload when a file in
`client/` changes.

## Run in production mode

```shell
yarn build
yarn start
```

## Run via Docker

Build an image:

```shell
docker build -t poseshare .
```

Run the image. This creates a container.

```shell
docker run --name -p 3000:3000 poseshare
```

Stop the container from running. Do this from a separate terminal, since
you won't be able to use that one that is running Docker.

```shell
docker stop $(docker ps -q --filter ancestor=poseshare)
```
