const NewReply = require('../NewReply');

describe('NewReply Entities', () => {
  it('should throw error if payload did not contain needed property', () => {
    // Arrange
    const payload = {};
    // Action and Assert
    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if payload did meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123,
    };
    // Action and Assert
    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newReply object correctly', () => {
    // Arrange
    const payload = {
      content: 'ini balasan',
    };

    // Action
    const newReply = new NewReply(payload);

    // Assert
    expect(newReply).toBeInstanceOf(NewReply);
    expect(newReply.content).toBeDefined();
    expect(newReply.content).toStrictEqual(payload.content);
  });
});
