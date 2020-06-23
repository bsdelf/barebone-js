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

### /src/core

Core facilities for application lifecycle.

#### 1. Application

`Application` class provides lifecycle hooks.

#### 2. Bootstrap

`bootstrap` function is responsible for context initialization and application startup.

#### 3. Context

`Context` is composed by various long lived objects like:

- Config
- Logger
- HTTP Client
- MySQL Client
- Redis Client

Each object has a corresponding [provider](#srcproviders), which is responsible for object construction and destruction.

### /src/providers

Context object providers. They follow factory pattern. Each provider has following elements:

- Dependencies: providers required by object constructor.
- Constructor: construct a new object with given dependencies.
- Destructor: destroy a given object.

With above information and methods, a topological sorting ([dag-maker](https://www.npmjs.com/package/dag-maker)) will be applied for context object construction and destruction.

### /src/commands

Commands for specific tasks. They are expected to be invoked by applications like Cron，CLI，Worker.

Business logic can be implemented completely in commands. However, let commands be access layer and put actual business logic in [controllers](#srccontrollers) could make your code reusable.

### /src/routes

Routes for HTTP server.

Routes are responsible for I/O:

- authenticate
- validate inputs
- invoke related components with inputs to serve the request
- build and validate outputs, rule out sensitive data

### /src/procedures

Procedures for RPC server.

Procedures are quite similar to routes, they handle I/O stuffs.

### /src/controllers

Controllers, to be reused by other components. For example:

- Routes
- Procedures
- Commands

This is the place where most of your business logic should be implemented in.

Note, instances of controllers are short lived objects. Long lived objects should be kept in [context](#srccontext).

### /src/models

Models are primitive data abstractions. Controllers and other high level components rely on models to store data.

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

Portable utility functions and classes, expected to be context irrelevant. Code under this folder can be easliy reused by other projects or published to NPM for sharing.

## Architecture

![architecture](docs/ideal.svg)

The entire software has roughly four layers, from outer to inner:

- Applications: entrances.
- Access Layer: I/O, authenticate, request dispatch.
- Controllers: request processing.
- Models: primitive data abstractions.

Also, there are a couple of long lived "system services" mananged by context which are global available to above components.

With this architecture, project can easily achieve horizontal scale and functional scale. See [the scale cube](https://microservices.io/articles/scalecube.html) of microservices.
