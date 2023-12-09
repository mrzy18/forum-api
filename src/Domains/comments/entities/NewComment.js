class NewComment {
  constructor(payload) {
    this._validatePayload(payload);
    const { content } = payload;

    this.content = content;
  }

  _validatePayload(payload) {
    const { content } = payload;

    if (!content) {
      throw new Error('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string') {
      throw new Error('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewComment;
