const DetailReply = require('../DetailReply');

describe('DetailReply Entities', () => {
  it('should throw error if payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      commentId: 'comment-123',
      content: 'ini balasan',
    };
    // Action and Assert
    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if payload did meet data type specification', () => {
    // Arrange
    const payload = {
      id: {},
      commentId: 'comment-123',
      content: 'ini balasan',
      date: 2023,
      username: true,
      isDelete: [],
    };
    // Action and Assert
    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addedReply object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      commentId: 'comment-123',
      content: 'ini balasan',
      date: '30-06-2023',
      username: 'rizky',
      isDelete: false,
    };

    // Action
    const detailReply = new DetailReply(payload);

    // Assert
    expect(detailReply).toBeInstanceOf(DetailReply);
    expect(detailReply.id).toStrictEqual(payload.id);
    expect(detailReply.commentId).toStrictEqual(payload.commentId);
    expect(detailReply.content).toStrictEqual(payload.content);
    expect(detailReply.date).toStrictEqual(payload.date);
    expect(detailReply.username).toStrictEqual(payload.username);
    expect(detailReply.isDelete).toStrictEqual(undefined);
  });
});
