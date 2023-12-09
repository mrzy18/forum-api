const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddReplyUseCase = require('../AddReplyUseCase');
const NewReply = require('../../../Domains/replies/entities/NewReply');

describe('AddReplyUseCase', () => {
  it('should orchastrating the add reply correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'ini balasan',
    };
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    const useCaseCredentials = {
      userId: 'user-123',
    };
    const expectAddedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCaseCredentials.userId,
    });

    /** creating depedency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.checkAvailabilityThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkAvailbilityComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(new AddedReply({
        id: 'reply-123',
        content: useCasePayload.content,
        owner: useCaseCredentials.userId,
      })));

    /** create use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const addedReply = await addReplyUseCase
      .execute(useCaseParams, useCasePayload, useCaseCredentials.userId);

    // Assert
    expect(mockThreadRepository.checkAvailabilityThread).toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.checkAvailbilityComment).toBeCalledWith(useCaseParams.commentId);
    expect(mockReplyRepository.addReply).toBeCalledWith(
      new NewReply({ content: useCasePayload.content }),
      useCaseParams.commentId,
      useCaseCredentials.userId,
    );
    expect(addedReply).toStrictEqual(expectAddedReply);
  });
});
