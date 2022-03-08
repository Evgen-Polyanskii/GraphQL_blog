module.exports = `
  scalar Date
  
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
  
  type Query {
    getUserComments(page: Int, perPage: Int): CommentsList
  }
  
  type Mutation {
    createComment(body: String!, postId: Int!): CommentInfo
  }
`;
