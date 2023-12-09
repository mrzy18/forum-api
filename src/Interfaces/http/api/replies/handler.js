const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;
  }

  async postAddReplyHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const addReplyUseCase = await this._container.getInstance(AddReplyUseCase.name);
    const addedReply = await addReplyUseCase.execute(request.params, request.payload, owner);

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyHandler(request) {
    const { id: owner } = request.auth.credentials;
    const deleteReplyUseCase = await this._container.getInstance(DeleteReplyUseCase.name);
    await deleteReplyUseCase.execute(request.params, owner);

    return {
      status: 'success',
    };
  }
}

module.exports = RepliesHandler;
