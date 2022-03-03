const { DataSource } = require('apollo-datasource');
const lodash = require('lodash');

class PostAPI extends DataSource {
  constructor(store) {
    super();
    this.store = store;
  }

  initialize(config) {
    this.context = config.context;
  }

  async createPost(args) {
    const { title, body } = args;
    const newPost = await this.store.Post.create({
      title,
      body,
      author_id: this.context.user.id,
    });
    return {
      ...lodash.omit(newPost.dataValues, 'author_id'),
      authorsNickname: this.context.user.nickname,
    };
  }

  async findPostById(id, options = {}) {
    const post = await this.store.Post.findByPk(id, options);
    return post ? post.dataValues : null;
  }

  async getPostsWithPagination({ page = 1, perPage = 5 }, options = {}) {
    const { count, rows } = await this.store.Post.findAndCountAll({
      ...options,
      offset: perPage * page - perPage,
      limit: perPage,
    });
    const posts = rows.map(({ dataValues }) => dataValues);
    return {
      posts,
      totalPosts: count,
      totalPages: Math.ceil(count / perPage),
      lastPage: posts.length ? count <= perPage * page : true,
    };
  }
}

module.exports = PostAPI;
