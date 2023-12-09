const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase interface', () => {
  it('should orchestrating add comment function correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'ini comment',
    };
    const useCaseParams = {
      id: 'thread-123',
    };
    const useCaseCredential = {
      owner: 'user-123',
    };

    const expectedAddedComment = new AddedComment({
      id: 'comment-123',
      content: 'ini comment',
      owner: useCaseCredential.owner,
    });

    /** creating depedency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.checkAvailabilityThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(new AddedComment({
        id: 'comment-123',
        content: 'ini comment',
        owner: useCaseCredential.owner,
      })));

    /** create use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await addCommentUseCase
      .execute(useCasePayload, useCaseParams.id, useCaseCredential.owner);

    // Assert
    expect(mockThreadRepository.checkAvailabilityThread).toBeCalledWith(useCaseParams.id);
    expect(mockCommentRepository.addComment).toBeCalledWith(
      new NewComment({ content: useCasePayload.content }),
      useCaseParams.id,
      useCaseCredential.owner,
    );
    expect(addedComment).toStrictEqual(expectedAddedComment);
  });
});
