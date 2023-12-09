const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const LikeCommentUseCase = require('../LikeCommentUseCase');

describe('LikeCommentUseCase', () => {
  it('should orchestrating LikeCommentUseCase action correctly when user like a comment', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    const useCaseCredentials = {
      userId: 'user-123',
    };

    /** create use case depedency */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking */
    mockThreadRepository.checkAvailabilityThread = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkAvailbilityComment = jest.fn(() => Promise.resolve());
    mockLikeRepository.checkAvailabilityLike = jest.fn(() => Promise.resolve(false));
    mockLikeRepository.addLike = jest.fn(() => Promise.resolve());

    /** create use case instance */
    const likeCommentUseCase = new LikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await likeCommentUseCase.execute(useCaseParams, useCaseCredentials.userId);

    // Assert
    expect(mockThreadRepository.checkAvailabilityThread).toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.checkAvailbilityComment).toBeCalledWith(useCaseParams.commentId);
    expect(mockLikeRepository.checkAvailabilityLike)
      .toBeCalledWith(useCaseParams.commentId, useCaseCredentials.userId);
    expect(mockLikeRepository.addLike)
      .toBeCalledWith(useCaseParams.commentId, useCaseCredentials.userId);
  });

  it('should orchestrating LikeCommentUseCase action correctly when user unlike a comment', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    const useCaseCredentials = {
      userId: 'user-123',
    };

    /** create use case depedency */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking */
    mockThreadRepository.checkAvailabilityThread = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkAvailbilityComment = jest.fn(() => Promise.resolve());
    mockLikeRepository.checkAvailabilityLike = jest.fn(() => Promise.resolve(true));
    mockLikeRepository.unlike = jest.fn(() => Promise.resolve());

    /** create use case instance */
    const likeCommentUseCase = new LikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await likeCommentUseCase.execute(useCaseParams, useCaseCredentials.userId);

    // Assert
    expect(mockThreadRepository.checkAvailabilityThread).toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.checkAvailbilityComment).toBeCalledWith(useCaseParams.commentId);
    expect(mockLikeRepository.checkAvailabilityLike)
      .toBeCalledWith(useCaseParams.commentId, useCaseCredentials.userId);
    expect(mockLikeRepository.unlike)
      .toBeCalledWith(useCaseParams.commentId, useCaseCredentials.userId);
  });
});
