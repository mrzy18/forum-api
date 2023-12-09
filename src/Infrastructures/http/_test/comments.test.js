const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const container = require('../../container');
const AuthenticationsTestHelper = require('../../../../tests/AuthenticationsTestHelper');

describe('/threads/{threadId}/comments endpoint', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /threads/{threadId}/comments', () => {
    it('should response 401 if no access token', async () => {
      // Arrange
      const requestPayload = {
        content: 'ini comment',
      };
      const requestParams = {
        threadId: 'thread-123',
      };
      const server = await createServer(container);
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: requestParams.threadId, owner: 'user-123' });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${requestParams.threadId}/comments`,
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 if request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = { };
      const requestParams = {
        threadId: 'thread-123',
      };
      const server = await createServer(container);
      const { userId, accessToken } = await AuthenticationsTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThread({ id: requestParams.threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${requestParams.threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('harus mengirimkan content');
    });

    it('should response 400 if request payload not meet data specifications', async () => {
      // Arrange
      const requestPayload = {
        content: 123,
      };
      const requestParams = {
        threadId: 'thread-123',
      };
      const server = await createServer(container);
      const { userId, accessToken } = await AuthenticationsTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThread({ id: requestParams.threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${requestParams.threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('content harus bertipe string');
    });

    it('should response 404 if threadId does not exist or invalid', async () => {
      // Arrange
      const requestPayload = {
        content: 'ini comment',
      };
      const requestParams = {
        threadId: 'thread-123',
      };
      const server = await createServer(container);
      const { userId, accessToken } = await AuthenticationsTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThread({ id: requestParams.threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-321/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 201 when request payload is correct', async () => {
      // Arrange
      const requestPayload = {
        content: 'ini comment',
      };
      const requestParams = {
        threadId: 'thread-123',
      };
      const server = await createServer(container);
      const { userId, accessToken } = await AuthenticationsTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThread({ id: requestParams.threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${requestParams.threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.id).toBeDefined();
      expect(responseJson.data.addedComment.content).toBeDefined();
      expect(responseJson.data.addedComment.owner).toBeDefined();
    });
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 401 if no access token', async () => {
      // Arrange
      const requestParams = {
        threadId: 'thread-123',
        commentId: 'comment-123',
      };
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: requestParams.threadId, owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: requestParams.commentId, threadId: requestParams.threadId, owner: 'user-123' });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${requestParams.threadId}/comments/${requestParams.commentId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 if threadId or commentId does not exist or invalid', async () => {
      // Arrange
      const server = await createServer(container);
      const { userId, accessToken } = await AuthenticationsTestHelper.getAccessToken({ server });
      const requestParams = {
        threadId: 'thread-123',
        commentId: 'comment-123',
      };
      await ThreadsTableTestHelper.addThread({
        id: requestParams.threadId,
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: requestParams.commentId,
        owner: userId,
      });

      // Action
      /** Response if threadId is invalid */
      const responseThread = await server.inject({
        method: 'DELETE',
        url: `/threads/thread-321/comments/${requestParams.commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      /** Response if commentId is invalid */
      const responseComment = await server.inject({
        method: 'DELETE',
        url: `/threads/${requestParams.threadId}/comments/comment-321`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      /** ThreadId Invalid */
      const responseJsonThread = JSON.parse(responseThread.payload);
      expect(responseThread.statusCode).toEqual(404);
      expect(responseJsonThread.status).toEqual('fail');
      expect(responseJsonThread.message).toEqual('thread tidak ditemukan');
      /** CommentId Invalid */
      const responseJsonComment = JSON.parse(responseComment.payload);
      expect(responseComment.statusCode).toEqual(404);
      expect(responseJsonComment.status).toEqual('fail');
      expect(responseJsonComment.message).toEqual('komentar tidak ditemukan');
    });

    it('should response 403 if user does not have access to delete the comment', async () => {
      // Arrange
      const requestParams = {
        threadId: 'thread-123',
        commentId: 'comment-123',
      };
      const server = await createServer(container);
      const { userId } = await AuthenticationsTestHelper.getAccessToken({ server, username: 'rizky' });
      const { accessToken } = await AuthenticationsTestHelper.getAccessToken({ server, username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: requestParams.threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: requestParams.commentId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${requestParams.threadId}/comments/${requestParams.commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda tidak boleh menghapus komentar ini');
    });

    it('should response 200 when delete comment is correct', async () => {
      // Arrange
      const requestParams = {
        threadId: 'thread-123',
        commentId: 'comment-123',
      };
      const server = await createServer(container);
      const { userId, accessToken } = await AuthenticationsTestHelper.getAccessToken({ server, username: 'rizky' });
      await ThreadsTableTestHelper.addThread({ id: requestParams.threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: requestParams.commentId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${requestParams.threadId}/comments/${requestParams.commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
