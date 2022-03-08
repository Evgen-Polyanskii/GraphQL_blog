module.exports = `
  scalar Upload

  type AuthToken {
    token: String!
  }
  
  type uploadResult {
    message: String!
  }
     
  type Mutation {
    singleUpload(file: Upload!): uploadResult!
    signup(nickname: String!, email: String!, password: String!): AuthToken!
    login(email: String!, password: String!): AuthToken!
  }
`;
