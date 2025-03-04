import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import { baseTypeDefs, studentTypeDefs, courseTypeDefs } from './typedefs/index.js';
import { studentResolvers, courseResolvers } from './resolvers/index.js';
import connectDB from './config/db.js';
import config from './config/config.js';
import authMiddleware from './middleware/auth.js';

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs: [baseTypeDefs, studentTypeDefs, courseTypeDefs],
    resolvers: [studentResolvers, courseResolvers],
    context: async ({ req }) => {
      return await authMiddleware(req);
    },
    formatError: (error) => {
      console.error(error);
      
      return {
        message: error.message,
        locations: error.locations,
        path: error.path
      };
    }
  });

  await server.start();
  server.applyMiddleware({ app });

  const PORT = config.PORT;
  app.listen(PORT, () => {
    console.log(`Server Successfully Running On Port ${PORT}`);
    console.log(`GraphQL Endpoint Available At http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startApolloServer().catch(error => {
  console.error(`Something Went Wrong Starting Apollo Server: ${error}`)
});