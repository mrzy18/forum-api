const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const pool = require('../../database/postgres/pool');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');

describe('CommentRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'rizky',
      password: 'abc',
      fullname: 'muhammad rizky',
    });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add new comment correctly', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'ini comment',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const { id } = await commentRepositoryPostgres.addComment(newComment, 'thread-123', 'user-123');

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById(id);
      expect(comment).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'ini comment',
      });

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(newComment, 'thread-123', 'user-123');

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'ini comment',
        owner: 'user-123',
      }));
    });
  });

  describe('deleteComment function', () => {
    it('should response with 200 and delete comment correctly', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteComment('comment-123');
      const comment = await CommentsTableTestHelper.findCommentById('comment-123');
      // Assert
      expect(comment[0].is_delete).toEqual(true);
    });
  });

  describe('checkAvailbilityComment function', () => {
    it('should throw NotFoundError when comment is not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      expect(() => commentRepositoryPostgres.checkAvailbilityComment('comment-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment is found', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(commentRepositoryPostgres.checkAvailbilityComment('comment-123'))
        .resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError when user is not the comment owner', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      expect(() => commentRepositoryPostgres.verifyCommentOwner({ commentId: 'comment-123', owner: 'user-321' }))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when user is the comment owner', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner({ commentId: 'comment-123', owner: 'user-123' }))
        .resolves.not.toThrowError();
    });
  });

  describe('getComments function', () => {
    it('should return all comment from a thread correctly', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        content: 'ini comment 1',
        owner: 'user-123',
        threadId: 'thread-123',
        date: '28-06-2023',
        isDelete: false,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-2',
        content: 'ini comment 2',
        owner: 'user-123',
        threadId: 'thread-123',
        date: '29-06-2023',
        isDelete: true,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getComments('thread-123');

      // Assert
      expect(comments).toEqual([
        new DetailComment({
          id: 'comment-1',
          username: 'rizky',
          date: '28-06-2023',
          content: 'ini comment 1',
          isDelete: false,
        }),
        new DetailComment({
          id: 'comment-2',
          username: 'rizky',
          date: '29-06-2023',
          content: 'ini comment 2',
          isDelete: true,
        }),
      ]);
    });
  });
});
