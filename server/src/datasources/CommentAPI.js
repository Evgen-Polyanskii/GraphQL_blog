const { DataSource } = require('apollo-datasource');
const lodash = require('lodash');

const { getDate } = require('../../lib/utilities.js');

class CommentAPI extends DataSource {
  constructor(store) {
    super();
    this.store = store;
  }

  initialize(config) {
    this.context = config.context;
  }

  async createComment(args) {
    const { body, postId } = args;
    const hasPostExists = await this.store.Post.findByPk(postId);
    if (!hasPostExists) throw new Error('Post not found.');
    const newComment = await this.store.Comment.create({
      body,
      post_id: postId,
      author_id: this.context.user.userId,
    });
    const publicationDate = getDate(newComment.dataValues.published_at);
    return {
      ...lodash.omit(newComment.dataValues, ['author_id', 'post_id']),
      postId,
      published_at: publicationDate,
      authorsNickname: this.context.user.nickname,
    };
  }

  async getUserCommentsWithPagination({ userId, page = 1, perPage = 5 }, options = {}) {
    const { count, rows } = await this.store.Comment.findAndCountAll({
      where: { author_id: userId },
      ...options,
      include: [{
        model: this.store.Post, as: 'post', foreignKey: 'post_id', attributes: ['title'],
      }],
      offset: perPage * page - perPage,
      limit: perPage,
    });
    const comments = rows.map(({ dataValues }) => ({
      ...dataValues,
      post: dataValues.post.dataValues.title,
      published_at: getDate(dataValues.published_at),
    }));
    return {
      comments,
      totalComments: count,
      totalPages: Math.ceil(count / perPage),
      lastPage: comments.length ? count <= perPage * page : true,
    };
  }
}

module.exports = CommentAPI;
