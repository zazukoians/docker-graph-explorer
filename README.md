# Graph Explorer (containerized)

A lightweight Dockerized web application for exploring RDF graphs using [Graph Explorer](https://github.com/zazuko/graph-explorer).
This project provides a Fastify-based server with Handlebars templating and static asset serving, ready to connect to any SPARQL endpoint.

## Features

- Visualize and explore RDF graphs interactively
- Connects to any SPARQL endpoint (default: DBpedia)
- Multi-language support
- Easily configurable via environment variables
- Docker-ready for easy deployment

## Quick Start

### Run with Docker

```sh
docker build -t docker-graph-explorer .
docker run -it --rm -p 3000:3000 docker-graph-explorer
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Locally (Node.js)

1. Install dependencies:

   ```sh
   npm ci
   ```

2. Start the server:

   ```sh
   npm run start
   ```

3. Visit [http://localhost:3000](http://localhost:3000)

## Configuration

You can configure the application using environment variables:

| Variable                | Description                         | Default                      |
| ----------------------- | ----------------------------------- | ---------------------------- |
| `PORT`                  | Port to run the server on           | `3000`                       |
| `HOST`                  | Host to bind the server             | `0.0.0.0`                    |
| `BASE_PATH`             | Base path for all routes            | `/`                          |
| `SPARQL_ENDPOINT`       | URL of the SPARQL endpoint          | `https://dbpedia.org/sparql` |
| `ACCEPT_BLANK_NODES`    | Accept blank nodes (`true`/`false`) | `false`                      |
| `DATA_LABEL_PROPERTY`   | Property for data labels            | `rdfs:label`                 |
| `SCHEMA_LABEL_PROPERTY` | Property for schema labels          | `rdfs:label`                 |
| `LANGUAGE`              | Default language code               | `en`                         |
| `LANGUAGES`             | JSON array of language options      | See below                    |

**Example for `LANGUAGES`:**

```json
[
  { "code": "en", "label": "English" },
  { "code": "de", "label": "German" },
  { "code": "fr", "label": "French" }
]
```

## Health Check

A health check endpoint is available at:

```
GET /healthz
```

Returns `OK` if the server is running.
