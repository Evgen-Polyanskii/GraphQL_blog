const { DataSource } = require('apollo-datasource');
const lodash = require('lodash');

const { getDate } = require('../../lib/utilities.js');

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
      author_id: this.context.user.userId,
    });
    const publicationDate = getDate(newPost.dataValues.published_at);
    return {
      ...lodash.omit(newPost.dataValues, 'author_id'),
      published_at: publicationDate,
      authorsNickname: this.context.user.nickname,
    };
  }

  async findPostById(id, options = {}) {
    const post = await this.store.Post.findByPk(id, options);
    return post
      ? { ...post.dataValues, published_at: getDate(post.dataValues.published_at) } : null;
  }

  async getPostsWithPagination({ page = 1, perPage = 5 }, options = {}) {
    const { count, rows } = await this.store.Post.findAndCountAll({
      ...options,
      offset: perPage * page - perPage,
      limit: perPage,
    });
    const posts = rows.map(({ dataValues }) => ({
      ...dataValues,
      published_at: getDate(dataValues.published_at),
    }));
    return {
      posts,
      totalPosts: count,
      totalPages: Math.ceil(count / perPage),
      lastPage: posts.length ? count <= perPage * page : true,
    };
  }
}

module.exports = PostAPI;
