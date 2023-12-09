const NewReply = require('../../Domains/replies/entities/NewReply');

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCaseParams, useCasePayload, owner) {
    const { threadId, commentId } = useCaseParams;

    await this._threadRepository.checkAvailabilityThread(threadId);
    await this._commentRepository.checkAvailbilityComment(commentId);
    const newReply = new NewReply(useCasePayload);
    return this._replyRepository.addReply(newReply, commentId, owner);
  }
}

module.exports = AddReplyUseCase;
