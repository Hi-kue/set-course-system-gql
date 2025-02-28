const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const typeDefs = require('./typedefs');
const resolvers = require('./resolvers');
const connectDB = require('./config/db');
const config = require('./config/config');
const authMiddleware = require('./middleware/auth');

// Connect to MongoDB
connectDB();

// Initialize Express
const app = express();

// Enable CORS
app.use(cors());

// Use express middleware for json parsing
app.use(express.json());

async function startApolloServer() {
  // Create Apollo server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      // Apply authentication middleware
      return await authMiddleware(req);
    },
    formatError: (error) => {
      // Log server errors
      console.error(error);
      
      // Return formatted error response
      return {
        message: error.message,
        locations: error.locations,
        path: error.path
      };
    }
  });

  // Start the Apollo server
  await server.start();

  // Apply Express middleware
  server.applyMiddleware({ app });

  // Start the server
  const PORT = config.PORT;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`GraphQL endpoint available at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

// Start the server
startApolloServer().catch(error => {
  console.error('Server startup error:', error);
});
