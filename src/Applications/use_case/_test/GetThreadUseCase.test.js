const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate the get thread detail correctly', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
    };

    const thread = {
      id: 'thread-123',
      title: 'judul thread',
      body: 'isi body',
      date: '28-06-2023',
      username: 'Rizky',
    };

    const comments = [
      new DetailComment({
        id: 'comment-123',
        username: 'user1',
        date: '28-06-2023',
        content: 'comment A',
        isDelete: false,
      }),
      new DetailComment({
        id: 'comment-321',
        username: 'user2',
        date: '28-06-2023',
        content: 'comment B',
        isDelete: true,
      }),
    ];

    const replies = [
      new DetailReply({
        id: 'reply-1',
        username: 'user1',
        content: 'ini balasan 1',
        date: '02-07-2023',
        commentId: 'comment-123',
        isDelete: false,
      }),
      new DetailReply({
        id: 'reply-2',
        username: 'user2',
        content: 'ini balasan 2',
        date: '02-07-2023',
        commentId: 'comment-123',
        isDelete: true,
      }),
    ];
    const expectedDetailThread = new DetailThread({

      id: 'thread-123',
      title: 'judul thread',
      body: 'isi body',
      date: '28-06-2023',
      username: 'Rizky',
      comments: [
        {
          id: 'comment-123',
          username: 'user1',
          date: '28-06-2023',
          content: 'comment A',
          replies: [
            {
              id: 'reply-1',
              content: 'ini balasan 1',
              date: '02-07-2023',
              username: 'user1',
            },
            {
              id: 'reply-2',
              content: '**balasan telah dihapus**',
              date: '02-07-2023',
              username: 'user2',
            },
          ],
          likeCount: 1,
        },
        {
          id: 'comment-321',
          username: 'user2',
          date: '28-06-2023',
          content: '**komentar telah dihapus**',
          replies: [],
          likeCount: 0,
        },
      ],
    });

    /** creating depedency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockLikeRepository = new LikeRepository();

    /** Mocking needed funtion */
    mockThreadRepository.checkAvailabilityThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(thread));
    mockCommentRepository.getComments = jest.fn()
      .mockImplementation(() => Promise.resolve(comments));
    mockReplyRepository.getReplies = jest.fn()
      .mockImplementation(() => Promise.resolve(replies));
    mockLikeRepository.getLikeCount = jest.fn()
      .mockImplementation((commentId) => Promise.resolve(commentId === comments[0].id ? 1 : 0));

    /** Create use case instance */
    const getThreadDetailUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const detailThread = await getThreadDetailUseCase.execute(useCaseParams);

    // Assert
    expect(mockThreadRepository.checkAvailabilityThread).toBeCalledWith(useCaseParams.threadId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.getComments).toBeCalledWith(useCaseParams.threadId);
    expect(mockReplyRepository.getReplies).toBeCalledWith(useCaseParams.threadId);
    expect(mockLikeRepository.getLikeCount).toBeCalledWith(comments[0].id);
    expect(detailThread).toEqual(expectedDetailThread);
  });
});
