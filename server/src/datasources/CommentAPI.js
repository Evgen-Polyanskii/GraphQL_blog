const { DataSource } = require('apollo-datasource');
const lodash = require('lodash');

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
      author_id: this.context.user.id,
    });
    return {
      ...lodash.omit(newComment.dataValues, ['author_id', 'post_id']),
      postId,
      authorsNickname: this.context.user.nickname,
    };
  }

  async getUserCommentsWithPagination({ page = 1, perPage = 5 }, options = {}) {
    const { count, rows } = await this.store.Comment.findAndCountAll({
      where: { author_id: this.context.user.id },
      ...options,
      include: [{
        model: this.store.Post, as: 'post', attributes: ['title'],
      }],
      offset: perPage * page - perPage,
      limit: perPage,
    });
    const comments = rows.map(({ dataValues }) => ({
      ...dataValues,
      post: dataValues.post.dataValues.title,
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
