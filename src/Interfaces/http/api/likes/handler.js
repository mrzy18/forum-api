const LikeCommentUseCase = require('../../../../Applications/use_case/LikeCommentUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;
  }

  async putLikeCommentHandler(request) {
    const { id: owner } = request.auth.credentials;
    const likeCommentUseCase = await this._container.getInstance(LikeCommentUseCase.name);
    await likeCommentUseCase.execute(request.params, owner);

    return {
      status: 'success',
    };
  }
}

module.exports = LikesHandler;
