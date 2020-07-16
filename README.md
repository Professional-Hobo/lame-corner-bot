# Lame Corner Bot

Custom bots with custom commands. Does whatever we need for discord.

## What are commands?

These are triggered when a guild message starts with the configured prefix. Take a look within the `commands/` dir. Each file has a description and examples of the command inside.

## What are jobs?

These are long running tasks that are triggered from various discord events.

## How to deploy

Just merge into the master branch. CI will take care of the deployment process.

## How to run locally

#### Install dependencies

- Docker
- MongoDB (Can be run in a container)

If you ever install or remove an npm dependency, make sure to rebuild the image:

```
docker-compose build
```

#### Set up `infranet` docker network

Only needed if it doesn't already exist. External containerized resources that the bot needs can be connected to this network.

```
npm run build:infranet
```

#### MongoDB connection

Either connect a mongo container to the infranet network, or have it running locally on your local machine. If running locally, your mongodb host will be `host.docker.internal`.

##### E.g. mongo container setup

```
docker run -d --name mongo --network infranet mongo:4
```

#### Fill out env vars

Create an `.env` file that's a copy of `example.env`. Fill it out.

#### Start the bot

```
npm start
```

## How to debug

Start the bot in debug mode and connect with a debugger front-end of your choice (e.g. vscode, chrome dev tools, etc.)

```
npm run debug
```
