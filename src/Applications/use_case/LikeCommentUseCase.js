class LikeCommentUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCaseParams, owner) {
    const { threadId, commentId } = useCaseParams;
    await this._threadRepository.checkAvailabilityThread(threadId);
    await this._commentRepository.checkAvailbilityComment(commentId);

    if (await this._likeRepository.checkAvailabilityLike(commentId, owner)) {
      await this._likeRepository.unlike(commentId, owner);
    } else {
      await this._likeRepository.addLike(commentId, owner);
    }
  }
}

module.exports = LikeCommentUseCase;
