const DetailThread = require('../DetailThread');

describe('DetailComment entities', () => {
  it('should throw erorr when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'judul thread',
      username: 'rizky',
      comments: [],
    };

    // Action and Assert
    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specifications', () => {
    // Arrange
    const payload = {
      id: 12345,
      title: 'judul thread',
      body: 'isi body',
      date: new Date().toISOString(),
      username: true,
      comments: {},
    };

    // Action and Assert
    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'judul thread',
      body: 'isi body',
      date: new Date().toISOString(),
      username: 'user-123',
      comments: [],
    };

    // Action and Assert
    const detailThread = new DetailThread(payload);
    expect(detailThread).toBeInstanceOf(DetailThread);
    expect(detailThread.id).toStrictEqual(payload.id);
    expect(detailThread.title).toStrictEqual(payload.title);
    expect(detailThread.body).toStrictEqual(payload.body);
    expect(detailThread.date).toStrictEqual(payload.date);
    expect(detailThread.username).toStrictEqual(payload.username);
    expect(detailThread.comments).toStrictEqual(payload.comments);
  });
});
