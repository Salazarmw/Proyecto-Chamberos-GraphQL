const { gql } = require('apollo-server');

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    phone: String
    profileImage: String
    createdAt: String!
    updatedAt: String!
  }

  type Chambero {
    id: ID!
    user: User!
    skills: [String]!
    rating: Float
    reviews: [Review]
    createdAt: String!
    updatedAt: String!
  }

  type Review {
    id: ID!
    chambero: Chambero!
    user: User!
    rating: Int!
    comment: String
    createdAt: String!
  }

  type Query {
    users: [User]
    user(id: ID!): User
    chamberos: [Chambero]
    chambero(id: ID!): Chambero
    reviews: [Review]
    review(id: ID!): Review
  }

  type Mutation {
    createUser(name: String!, email: String!, phone: String): User
    updateUser(id: ID!, name: String, email: String, phone: String): User
    createChambero(userId: ID!, skills: [String]!): Chambero
    createReview(chamberoId: ID!, userId: ID!, rating: Int!, comment: String): Review
  }
`;

module.exports = typeDefs; 