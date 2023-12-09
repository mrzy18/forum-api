const DetailComment = require('../DetailComment');

describe('DetailComment entities', () => {
  it('should throw erorr when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'rizky',
      date: new Date().toISOString(),
    };

    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specifications', () => {
    // Arrange
    const payload = {
      id: 123,
      username: {},
      date: new Date().toISOString(),
      content: [],
      isDelete: false,
    };

    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'rizky',
      date: new Date().toISOString(),
      content: 'ini comment',
      isDelete: false,
    };

    // Action and Assert
    const detailComment = new DetailComment(payload);
    expect(detailComment).toBeInstanceOf(DetailComment);
    expect(detailComment.id).toStrictEqual(payload.id);
    expect(detailComment.username).toStrictEqual(payload.username);
    expect(detailComment.date).toStrictEqual(payload.date);
    expect(detailComment.content).toStrictEqual(payload.content);
    expect(detailComment.isDelete).toStrictEqual(undefined);
  });
});
