import express from "express";
import cors from "cors";
import { readFile } from 'node:fs/promises';
import { makeExecutableSchema } from "@graphql-tools/schema";
import { resolvers } from './resolvers.js';
import { expressMiddleware as apolloMiddleware } from '@apollo/server/express4';
import { ApolloServer } from "@apollo/server";
import { createServer as createHttpServer } from 'node:http'
import { WebSocketServer } from "ws";
import { useServer as useWsServer } from 'graphql-ws/lib/use/ws'
import { authMiddleware, handleLogin } from "./auth.js";

const PORT = 9000;

const app = express();
app.use(cors(), express.json());

app.post('/login', handleLogin);

function getContext({ req }) {
  if (req.auth) {
    return { user: req.auth.sub };
  }
  return {};
}

const typeDefs = await readFile('./schema.graphql', 'utf8');
const schema = makeExecutableSchema({typeDefs, resolvers})
const apolloServer = new ApolloServer({ schema });

await apolloServer.start();
app.use('/graphql', authMiddleware, apolloMiddleware(apolloServer, {
  context: getContext,
}));

const httpServer = createHttpServer(app);
const wsServer = new WebSocketServer({server: httpServer, path: '/graphql'});
useWsServer({ schema }, wsServer);

httpServer.listen({port: PORT}, () => {
  console.log(`Server started on port ${PORT}`)
})
