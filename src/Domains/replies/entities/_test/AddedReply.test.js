const AddedReply = require('../AddedReply');

describe('AddedReply Entities', () => {
  it('should throw error if payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      owner: 'user-123',
    };
    // Action and Assert
    expect(() => new AddedReply(payload)).toThrowError('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if payload did meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 123,
      owner: [],
    };
    // Action and Assert
    expect(() => new AddedReply(payload)).toThrowError('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addedReply object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'ini balasan',
      owner: 'user-123',
    };

    // Action
    const addedReply = new AddedReply(payload);

    // Assert
    expect(addedReply).toBeInstanceOf(AddedReply);
    expect(addedReply.id).toStrictEqual(payload.id);
    expect(addedReply.content).toStrictEqual(payload.content);
    expect(addedReply.owner).toStrictEqual(payload.owner);
  });
});
