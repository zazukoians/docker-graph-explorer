import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import Fastify from "fastify";
import pointOfView from "@fastify/view";
import fastifyStatic from "@fastify/static";

import handlebars from "handlebars";

import { resolve } from "import-meta-resolve";

// Server configuration
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const host = process.env.HOST || "0.0.0.0";
const basePathConfig = process.env.BASE_PATH || "/";
const basePath = basePathConfig.endsWith("/")
  ? basePathConfig
  : `${basePathConfig}/`;

// Graph Explorer configuration
const endpointUrl = process.env.SPARQL_ENDPOINT || "https://dbpedia.org/sparql";
const acceptBlankNodes = process.env.ACCEPT_BLANK_NODES === "true" || false;
const dataLabelProperty = process.env.DATA_LABEL_PROPERTY || "rdfs:label";
const schemaLabelProperty = process.env.SCHEMA_LABEL_PROPERTY || "rdfs:label";
const language = process.env.LANGUAGE || "en";
const languages = process.env.LANGUAGES
  ? JSON.parse(process.env.LANGUAGES)
  : [
      { code: "en", label: "English" },
      { code: "de", label: "German" },
      { code: "fr", label: "French" },
      { code: "it", label: "Italian" },
    ];

const currentDir = dirname(fileURLToPath(import.meta.url));
const server = Fastify({
  logger: true,
});

const distPath = resolve("graph-explorer/dist/", import.meta.url);
server.register(fastifyStatic, {
  root: distPath.replace(/^file:\/\//, ""),
  prefix: `${basePath}assets/`,
  decorateReply: false,
});
server.register(fastifyStatic, {
  root: `${currentDir}/static/`,
  prefix: `${basePath}static/`,
  decorateReply: false,
});

server.register(pointOfView, {
  engine: {
    handlebars,
  },
  root: join("src", "views"),
  layout: join("templates", "default.hbs"),
  viewExt: "hbs",
});

// Healthz route
server.get(`${basePath}healthz`, async (request, reply) => {
  reply.type("text/plain").send("OK");
});

server.get(basePath, async (request, reply) => {
  return reply.view("graph-explorer.hbs", {
    // Just forward all the config as a string
    graphExplorerConfig: JSON.stringify({
      endpointUrl,
      acceptBlankNodes,
      dataLabelProperty,
      schemaLabelProperty,
      language,
      languages,
    }).replace(/'/g, "\\'"),
  });
});

if (basePath !== "/") {
  server.get(basePath.replace(/\/$/, ""), async (request, reply) => {
    return reply.redirect(basePath, 301);
  });
}

server.listen({ port, host }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
