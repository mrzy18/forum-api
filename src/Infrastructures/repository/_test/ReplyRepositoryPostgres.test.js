const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const pool = require('../../database/postgres/pool');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');
const ReplyRepositoryPostgres = require('../ReplyRepositorypostgres');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'rizky',
      password: 'abc',
      fullname: 'muhammad rizky',
    });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      content: 'ini comment',
      owner: 'user-123',
      threadId: 'thread-123',
    });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist add new reply correctly', async () => {
      // Arrange
      const newReply = new NewReply({
        content: 'ini balasan',
      });

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const { id } = await replyRepositoryPostgres.addReply(newReply, 'comment-123', 'user-123');

      // Assert
      const reply = await RepliesTableTestHelper.findReplyById(id);
      expect(reply).toHaveLength(1);
    });

    it('should return added reply correctly', async () => {
      // Arrange
      const newReply = new NewReply({
        content: 'ini balasan',
      });

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(newReply, 'comment-123', 'user-123');

      // Assert
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: 'ini balasan',
        owner: 'user-123',
      }));
    });
  });

  describe('checkAvailabilityReply function', () => {
    it('should throw NotFoundError when reply is not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action and Assert
      expect(() => replyRepositoryPostgres.checkAvailabilityReply('reply-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment is found', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(replyRepositoryPostgres.checkAvailabilityReply('reply-123'))
        .resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError when user is not the reply owner', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action and Assert
      expect(() => replyRepositoryPostgres.verifyReplyOwner({ replyId: 'reply-123', owner: 'user-321' }))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when user is the reply owner', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner({ replyId: 'reply-123', owner: 'user-123' }))
        .resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteReply function', () => {
    it('should response with 200 and delete reply correctly', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        isDelete: false,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReply('reply-123');
      const reply = await RepliesTableTestHelper.findReplyById('reply-123');
      // Assert
      expect(reply[0].is_delete).toEqual(true);
    });
  });

  describe('getReplies function', () => {
    it('should return all reply from a comment correctly', async () => {
      // Arrange
      /** Reply 1 */
      await RepliesTableTestHelper.addReply({
        id: 'reply-1',
        commentId: 'comment-123',
        owner: 'user-123',
        content: 'ini balasan 1',
        date: '28-06-2023',
        isDelete: false,
      });
      /** Reply 2 */
      await RepliesTableTestHelper.addReply({
        id: 'reply-2',
        commentId: 'comment-123',
        owner: 'user-123',
        content: 'ini balasan 2',
        date: '29-06-2023',
        isDelete: true,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getReplies('thread-123');

      // Assert
      expect(replies).toEqual([
        new DetailReply({
          id: 'reply-1',
          commentId: 'comment-123',
          owner: 'user-123',
          content: 'ini balasan 1',
          date: '28-06-2023',
          username: 'rizky',
          isDelete: false,
        }),
        new DetailReply({
          id: 'reply-2',
          commentId: 'comment-123',
          owner: 'user-123',
          content: 'ini balasan 2',
          date: '29-06-2023',
          username: 'rizky',
          isDelete: true,
        }),
      ]);
    });
  });
});
