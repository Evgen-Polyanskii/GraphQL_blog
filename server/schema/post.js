module.exports = `
  scalar Date
  
  type Post {
    title: String!
    body: String!
    published_at: Date! 
  }
  
  type PostsList {
    totalPosts: Int!
    totalPages: Int!
    lastPage: Boolean!
    posts: [Post]!
  }
  
  type PostInfo {
    id: Int!
    title: String!
    body: String!
    published_at: Date!
    authorsNickname: String!
  }
  
  extend type Query {
    getPostById(id: Int!): Post
    getPostsList(page: Int, perPage: Int): PostsList
  }
  
  type Mutation {
    createPost(title: String!, body: String!, published_at: String): PostInfo
  }
`;
