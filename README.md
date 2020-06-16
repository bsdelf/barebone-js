# barebone-js

barebone-js is a backend boilerplate for Node.js and TypeScript. It's not a framework, but is a way of thinking, which leads to maintainability and scalability. Regardless the runtime, the basic idea behind this project could be applied to backend projects in other programming languages.

## Features

- TypeScript
- Graceful kill
- Stacked configurations
- Extensible application context
- Well-organized project structure
- Almost zero learning curve

## Project Structure

### /config

Config files. When application start, a portion of config files under this folder will be read, stacked, and merged into a single config object based on `NODE_ENV`.

For development, staging, and production environment, the config stack is:

1. config.default.yaml
2. config.\<_environment_\>.yaml (optional)
3. config.local.yaml (optional, highest priority)

For unit test, the configs stack is:

1. config.default.yaml
2. config.test.yaml (optional)
3. config.local.test.yaml (optional, highest priority)

To inspect the merged config object:

```
npm run cli:dev config:dump
```

In practice, the default and environmental configs are supposed to store generic insensitive settings like URL and port. While the local config is supposed to store variable and sensitive settings like tokens and passwords. Local config should never be committed into repository or built into image. For kubernetes deployments, we suggest use [volumes](https://kubernetes.io/docs/concepts/storage/volumes/) to mount local config into container.

### /src/applications

Main applications for your project. For example:

- REST server: RESTful API server
- RPC server: HTTP or websocket server
- Cron: time-based job scheduler
- Worker: message queue consumer
- CLI: command line tools for operation or debug

Source code under this folder should keep short and concise.

They just like Go's [cmd](https://github.com/golang-standards/project-layout/tree/master/cmd).

### /src/commands

Commands for specific tasks. They are expected to be invoked by applications like command line utility and cron server.

Business logic can be implemented completely in commands. However, let commands play "coordinator" role, and put actual business logic in [controllers](#srccontrollers) could make your code more reusable.

### /src/routes

Routes for HTTP server.

### /src/procedures

Procedures for RPC server.

### /src/controllers

Controllers, to be reused by other components. For example:

- Routes
- Procedures
- Commands

This is the place where most of your business logic should be implemented in.

Note, controllers should be stateless. Long lived global states should be kept in [context](#srccontext).

### /src/models

Sequelize models.

### /src/context

Context is global available. It is composed by various long lived objects like:

- Logger
- Config
- HTTP Client
- MySQL Client
- Redis Client

Each object has a corresponding [provider](#srcproviders), and providers may have dependencies (other providers). Therefore, we use topological sorting ([dag-maker](https://www.npmjs.com/package/dag-maker)) to initialize and finalize context.

### /src/providers

Context provider.

### /src/migrations

Sequelize migrations.

Initialize migration for the first time:

```
npm run cli:dev migration:init
```

Create a new migration:

```
npm run cli:dev migration:create -- --name create-my-table
```

Apply all pending migrations:

```
npm run cli:dev migration:up
```

Undo the most recent migration:

```
npm run cli:dev migration:down
```

### /src/libraries

Utility functions and classes.

## Architecture

![architecture](docs/ideal.svg)

By following this boilerplate, your well developed project will eventually accomplish the above architecture.

The entire software roughly has four layers, from outer to inner:

- Applications
- Coordinators
- Controllers
- Models

Most of them are stateless. Stateful parts are well handled by context and providers.

With this architecture, your project can easily achieve horizontal scale and functional scale. See [the scale cube](https://microservices.io/articles/scalecube.html).
