const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import schemas and resolvers
const typeDefs = require('./schemas');
const resolvers = require('./resolvers');

// Import data sources
const UserAPI = require('./datasources/UserAPI');
const ChamberoAPI = require('./datasources/ChamberoAPI');
const QuoteAPI = require('./datasources/QuoteAPI');
const ReviewAPI = require('./datasources/ReviewAPI');

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Authentication middleware
const getUser = token => {
  try {
    if (token) {
      return jwt.verify(token, process.env.JWT_SECRET);
    }
    return null;
  } catch (err) {
    return null;
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    userAPI: new UserAPI(),
    chamberoAPI: new ChamberoAPI(),
    quoteAPI: new QuoteAPI(),
    reviewAPI: new ReviewAPI()
  }),
  context: ({ req }) => {
    const token = req.headers.authorization || '';
    const user = getUser(token.replace('Bearer ', ''));
    return { user };
  },
  formatError: error => {
    console.error(error);
    return error;
  }
});

server.listen({ port: process.env.PORT || 4000 })
  .then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  }); 