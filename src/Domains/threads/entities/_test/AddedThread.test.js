const AddedThread = require('../AddedThread');

describe('AddedThread entities', () => {
  it('should throw error if payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'judul thread',
    };

    // Action and Assert
    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: 'judul thread',
      owner: true,
    };

    // Action and Assert
    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addedThread correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'judul thread',
      owner: 'user-123',
    };

    // Action
    const addedThread = new AddedThread(payload);

    // Assert
    expect(addedThread).toBeInstanceOf(AddedThread);
    expect(addedThread.id).toStrictEqual(payload.id);
    expect(addedThread.title).toStrictEqual(payload.title);
    expect(addedThread.owner).toStrictEqual(payload.owner);
  });
});
