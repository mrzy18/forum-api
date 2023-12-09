const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTestHelper = require('../../../../tests/AuthenticationsTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ReplieTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('/threads endpoint', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ReplieTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /threads', () => {
    it('should response 401 if no access token', async () => {
      // Arrange
      const requestPayload = {
        title: 'judul thread',
        body: 'isi thread',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response with 400 if thread payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'judul thread',
      };
      const server = await createServer(container);

      /** get accessToken */
      const { accessToken } = await AuthenticationsTestHelper.getAccessToken({ server });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('harus mengirimkan title dan body');
    });

    it('should response with 400 if request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 'judul thread',
        body: ['isi body'],
      };

      const server = await createServer(container);
      /** get accessToken */
      const { accessToken } = await AuthenticationsTestHelper.getAccessToken({ server });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('title dan body harus bertipe string');
    });

    it('should response with 201 when request payload is correct', async () => {
      // Arrange
      const requestPayload = {
        title: 'judul thread',
        body: 'isi thread',
      };

      const server = await createServer(container);
      /** get accessToken */
      const { accessToken } = await AuthenticationsTestHelper.getAccessToken({ server });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.id).toBeDefined();
      expect(responseJson.data.addedThread.title).toBeDefined();
      expect(responseJson.data.addedThread.owner).toBeDefined();
    });
  });

  describe('GET /threads/{threadId}', () => {
    beforeEach(async () => {
      /** Add user */
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      /** Add thread */
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      /** Add comment 1 */
      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        content: 'ini comment 1',
        owner: 'user-123',
        threadId: 'thread-123',
        date: '28-06-2023',
        isDelete: false,
      });
      /** Add comment 2 */
      await CommentsTableTestHelper.addComment({
        id: 'comment-2',
        content: 'ini comment 2',
        owner: 'user-123',
        threadId: 'thread-123',
        date: '29-06-2023',
        isDelete: true,
      });
      /** Add reply */
      await ReplieTableTestHelper.addReply({
        id: 'reply-1',
        commentId: 'comment-1',
        owner: 'user-123',
        content: 'ini balasan',
        date: '02-07-2013',
        isDelete: true,
      });
    });

    it('should response 404 if threadId does not exist or invalid', async () => {
      // Arrange
      const server = await createServer(container);
      const requestParams = {
        threadId: 'thread-321',
      };

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${requestParams.threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 200 and get thread object correctly', async () => {
      // Arrange
      const server = await createServer(container);
      const requestParams = {
        threadId: 'thread-123',
      };

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${requestParams.threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      const { thread } = responseJson.data;
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(typeof thread).toEqual('object');
      expect(thread.id).toBeDefined();
      expect(thread.title).toBeDefined();
      expect(thread.body).toBeDefined();
      expect(thread.date).toBeDefined();
      expect(thread.username).toBeDefined();
      expect(thread.comments).toBeDefined();
      expect(Array.isArray(thread.comments)).toEqual(true);
      expect(thread.comments[1].content).toEqual('**komentar telah dihapus**');
      expect(Array.isArray(thread.comments[0].replies)).toEqual(true);
      expect(thread.comments[0].replies[0].content).toEqual('**balasan telah dihapus**');
    });
  });
});
