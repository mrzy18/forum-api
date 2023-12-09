const getRepliesForEveryComment = require('../../Domains/replies/entities/GetRepliesForComment');

class GetThreadDetailUseCase {
  constructor({
    threadRepository, commentRepository, replyRepository, likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCaseParams) {
    const { threadId } = useCaseParams;
    await this._threadRepository.checkAvailabilityThread(threadId);
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getComments(threadId);
    const replies = await this._replyRepository.getReplies(threadId);
    thread.comments = getRepliesForEveryComment(comments, replies);
    thread.comments = await this._getLikeCount(comments);
    return thread;
  }

  async _getLikeCount(comments) {
    await Promise.all(comments.map(async (comment) => {
      comment.likeCount = await this._likeRepository.getLikeCount(comment.id);
    }));

    return comments;
  }
}

module.exports = GetThreadDetailUseCase;
