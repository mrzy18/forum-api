const getRepliesForEveryComment = require('../../Domains/replies/entities/GetRepliesForComment');

class GetThreadDetailUseCase {
  constructor({
    threadRepository, commentRepository, replyRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCaseParams) {
    const { threadId } = useCaseParams;
    await this._threadRepository.checkAvailabilityThread(threadId);
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getComments(threadId);
    const replies = await this._replyRepository.getReplies(threadId);
    thread.comments = getRepliesForEveryComment(comments, replies);
    return thread;
  }
}

module.exports = GetThreadDetailUseCase;
