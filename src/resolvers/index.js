const resolvers = {
  Query: {
    users: async (_, __, { dataSources }) => {
      return await dataSources.userAPI.getAllUsers();
    },
    user: async (_, { id }, { dataSources }) => {
      return await dataSources.userAPI.getUserById(id);
    },
    chamberos: async (_, __, { dataSources }) => {
      return await dataSources.chamberoAPI.getAllChamberos();
    },
    chambero: async (_, { id }, { dataSources }) => {
      return await dataSources.chamberoAPI.getChamberoById(id);
    },
    reviews: async (_, __, { dataSources }) => {
      return await dataSources.reviewAPI.getAllReviews();
    },
    review: async (_, { id }, { dataSources }) => {
      return await dataSources.reviewAPI.getReviewById(id);
    }
  },
  Mutation: {
    createUser: async (_, { name, email, phone }, { dataSources }) => {
      return await dataSources.userAPI.createUser({ name, email, phone });
    },
    updateUser: async (_, { id, name, email, phone }, { dataSources }) => {
      return await dataSources.userAPI.updateUser(id, { name, email, phone });
    },
    createChambero: async (_, { userId, skills }, { dataSources }) => {
      return await dataSources.chamberoAPI.createChambero({ userId, skills });
    },
    createReview: async (_, { chamberoId, userId, rating, comment }, { dataSources }) => {
      return await dataSources.reviewAPI.createReview({ chamberoId, userId, rating, comment });
    }
  },
  User: {
    chambero: async (user, _, { dataSources }) => {
      return await dataSources.chamberoAPI.getChamberoByUserId(user.id);
    }
  },
  Chambero: {
    user: async (chambero, _, { dataSources }) => {
      return await dataSources.userAPI.getUserById(chambero.userId);
    },
    reviews: async (chambero, _, { dataSources }) => {
      return await dataSources.reviewAPI.getReviewsByChamberoId(chambero.id);
    }
  },
  Review: {
    chambero: async (review, _, { dataSources }) => {
      return await dataSources.chamberoAPI.getChamberoById(review.chamberoId);
    },
    user: async (review, _, { dataSources }) => {
      return await dataSources.userAPI.getUserById(review.userId);
    }
  }
};

module.exports = resolvers; 