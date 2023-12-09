const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment correctly', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    const useCaseCredentials = {
      owner: 'user-123',
    };

    /** creating depedency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** Mocking needed funtion */
    mockThreadRepository.checkAvailabilityThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkAvailbilityComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** Create use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentUseCase.execute(useCaseParams, useCaseCredentials.owner);

    // Assert
    expect(mockThreadRepository.checkAvailabilityThread)
      .toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.checkAvailbilityComment)
      .toBeCalledWith(useCaseParams.commentId);
    expect(mockCommentRepository.verifyCommentOwner)
      .toBeCalledWith({ commentId: useCaseParams.commentId, owner: useCaseCredentials.owner });
    expect(mockCommentRepository.deleteComment)
      .toBeCalledWith(useCaseParams.commentId);
  });
});
