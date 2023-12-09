const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikeTableTestHelper');
const AuthenticationsTestHelper = require('../../../../tests/AuthenticationsTestHelper');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const container = require('../../container');

describe('/threads/{threadId}/comments/{commentId}/likes', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });
  afterAll(async () => {
    await pool.end();
  });
  describe('PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 401 if no access token', async () => {
      // Arrange
      const requestParams = {
        threadId: 'thread-123',
        commentId: 'comment-123',
      };
      const server = await createServer(container);
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'rizky',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${requestParams.threadId}/comments/${requestParams.commentId}/likes`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 if thread or comment does not exist or invalid', async () => {
      // Arrange
      const requestParams = {
        threadId: 'thread-123',
        commentId: 'comment-123',
      };
      const server = await createServer(container);
      const { userId, accessToken } = await AuthenticationsTestHelper.getAccessToken({ server, username: 'muhammadrizky' });
      await ThreadsTableTestHelper.addThread({ id: requestParams.threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: requestParams.commentId,
        owner: userId,
        threadId: requestParams.threadId,
      });

      // Action
      /** Response if threadId is invalid */
      const responseThread = await server.inject({
        method: 'PUT',
        url: `/threads/thread-321/comments/${requestParams.commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      /** Response if commentId is invalid */
      const responseComment = await server.inject({
        method: 'PUT',
        url: `/threads/${requestParams.threadId}/comments/comment-321/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      /** threadId invalid */
      const responseJsonThread = JSON.parse(responseThread.payload);
      expect(responseThread.statusCode).toEqual(404);
      expect(responseJsonThread.status).toEqual('fail');
      expect(responseJsonThread.message).toEqual('thread tidak ditemukan');
      /** CommentId invalid */
      const responseJsonComment = JSON.parse(responseComment.payload);
      expect(responseComment.statusCode).toEqual(404);
      expect(responseJsonComment.status).toEqual('fail');
      expect(responseJsonComment.message).toEqual('komentar tidak ditemukan');
    });

    it('should response 200 when like a comment', async () => {
      // Arrange
      const requestParams = {
        threadId: 'thread-123',
        commentId: 'comment-123',
      };
      const server = await createServer(container);
      const { userId, accessToken } = await AuthenticationsTestHelper.getAccessToken({ server, username: 'muhammadrizky' });
      await ThreadsTableTestHelper.addThread({ id: requestParams.threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: requestParams.commentId,
        owner: userId,
        threadId: requestParams.threadId,
      });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${requestParams.threadId}/comments/${requestParams.commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 200 when unlike a comment', async () => {
      // Arrange
      const requestParams = {
        threadId: 'thread-123',
        commentId: 'comment-123',
      };
      const server = await createServer(container);
      const { userId, accessToken } = await AuthenticationsTestHelper.getAccessToken({ server, username: 'muhammadrizky' });
      await ThreadsTableTestHelper.addThread({ id: requestParams.threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: requestParams.commentId,
        owner: userId,
        threadId: requestParams.threadId,
      });
      await LikesTableTestHelper.addLike({
        id: 'like-123',
        commentId: requestParams.commentId,
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${requestParams.threadId}/comments/${requestParams.commentId}/likes`,
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
