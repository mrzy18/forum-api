const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikeTableTestHelper');
const pool = require('../../database/postgres/pool');

describe('LikeRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'rizky',
      fullname: 'Muhammad Rizky',
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

    await CommentsTableTestHelper.addComment({
      id: 'comment-321',
      owner: 'user-123',
      threadId: 'thread-123',
    });

    await LikesTableTestHelper.addLike({
      id: 'like-123',
      commentId: 'comment-123',
      owner: 'user-123',
    });

    await LikesTableTestHelper.addLike({
      id: 'like-321',
      commentId: 'comment-123',
      owner: 'user-123',
    });
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addLike function', () => {
    it('should add like comment correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '1234';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.addLike('comment-123', 'user-123');

      // Assert
      const like = await LikesTableTestHelper.findLikeById('like-1234');
      expect(like).toHaveLength(1);
    });
  });

  describe('getLikeCount function', () => {
    it('should get like count correctly', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const likeCount = await likeRepositoryPostgres.getLikeCount('comment-123');

      // Assert
      expect(likeCount).toEqual(2);
    });
  });

  describe('unlike function', () => {
    it('should unlike comment correctly', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      await likeRepositoryPostgres.unlike('comment-123', 'user-123');

      // Assert
      const like = await LikesTableTestHelper.findLikeById('like-123');
      expect(like).toHaveLength(0);
    });
  });

  describe('checkAvailabilityLike function', () => {
    it('should return true if the comment already liked by user', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(likeRepositoryPostgres.checkAvailabilityLike('comment-123', 'user-123')).resolves.toBe(true);
    });

    it('should return false If the comment has not been liked by the user', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(likeRepositoryPostgres.checkAvailabilityLike('comment-321', 'user-123')).resolves.toBe(false);
    });
  });
});
