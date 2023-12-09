class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCaseParams, owner) {
    const { threadId, commentId, replyId } = useCaseParams;

    await this._threadRepository.checkAvailabilityThread(threadId);
    await this._commentRepository.checkAvailbilityComment(commentId);
    await this._replyRepository.checkAvailabilityReply(replyId);
    await this._replyRepository.verifyReplyOwner({ replyId, owner });
    await this._replyRepository.deleteReply(replyId);
  }
}
module.exports = DeleteReplyUseCase;
