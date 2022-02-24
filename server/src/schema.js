const { gql } = require('apollo-server');

const typeDefs = gql`
  type AuthToken {
    token: String!
  }
  
  type Post {
    title: String!
    body: String!
    published_at: String! 
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
    published_at: String!
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
    published_at: String!
  }
  
  type Query {
    getPostById(id: Int!): Post
    getPostsList(page: Int, perPage: Int): PostsList
    getUserComments(userId: Int!, page: Int, perPage: Int): CommentsList
  }
  
  type Mutation {
    signup(nickname: String!, email: String!, password: String!): AuthToken!
    login(email: String!, password: String!): AuthToken!
    createPost(title: String!, body: String!, published_at: String): PostInfo
    createComment(body: String!, postId: Int!): CommentInfo
  }
`;

module.exports = typeDefs;
