class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCaseParams, owner) {
    const { threadId, commentId } = useCaseParams;

    await this._threadRepository.checkAvailabilityThread(threadId);
    await this._commentRepository.checkAvailbilityComment(commentId);
    await this._commentRepository.verifyCommentOwner({ commentId, owner });
    await this._commentRepository.deleteComment(commentId);
  }
}
module.exports = DeleteCommentUseCase;
