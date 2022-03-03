const { gql } = require('apollo-server');

const typeDefs = gql`
  scalar Upload
  scalar Date
  
  type AuthToken {
    token: String!
  }
  
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
  
  type Comment {
    post: String!
    body: String!
    published_at: String!
  }
  
  type CommentsList {
    totalComments: Int!
    totalPages: Int!
    lastPage: Boolean!
    comments: [Comment]!
  }
  
  type CommentInfo {
    id: Int!
    body: String!
    postId: Int!
    authorsNickname: String!
    published_at: Date!
  }
  
  type uploadResult {
    message: String!
  }
  
  type reportMessage {
    message: String!
  }
  
  type Query {
    getPostById(id: Int!): Post
    getPostsList(page: Int, perPage: Int): PostsList
    getUserComments(page: Int, perPage: Int): CommentsList
    getAnalyticalReport(startDate: Date!, endDate: Date!, email: String!): reportMessage
  }
  
  type Mutation {
    singleUpload(file: Upload!): uploadResult!
    signup(nickname: String!, email: String!, password: String!): AuthToken!
    login(email: String!, password: String!): AuthToken!
    createPost(title: String!, body: String!, published_at: String): PostInfo
    createComment(body: String!, postId: Int!): CommentInfo
  }
`;

module.exports = typeDefs;
