const DetailComment = require('../../../comments/entities/DetailComment');
const DetailReply = require('../DetailReply');
const getRepliesForEveryComment = require('../GetRepliesForComment');

describe('GetRepliesForEveryComment Method', () => {
  it('should get replies for every comment and return it', () => {
    // Arrange
    const comments = [
      new DetailComment({
        id: 'comment-123',
        username: 'user1',
        date: '28-06-2023',
        content: 'comment A',
        isDelete: false,
      }),
      new DetailComment({
        id: 'comment-124',
        username: 'user2',
        date: '29-06-2023',
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
        date: '03-07-2023',
        commentId: 'comment-123',
        isDelete: true,
      }),
    ];
    const expectedResult = [
      {
        id: 'comment-123',
        content: 'comment A',
        date: '28-06-2023',
        username: 'user1',
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
            date: '03-07-2023',
            username: 'user2',
          },
        ],
      },
      {
        content: '**komentar telah dihapus**',
        date: '29-06-2023',
        id: 'comment-124',
        username: 'user2',
        replies: [],
      },
    ];

    // Action
    const result = getRepliesForEveryComment(comments, replies);

    // Assert
    expect(result).toEqual(expectedResult);
    expect(result[1].content).toStrictEqual('**komentar telah dihapus**');
  });
});
