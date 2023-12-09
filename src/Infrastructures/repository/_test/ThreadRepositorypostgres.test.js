const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'rizky',
      password: 'abc',
      fullname: 'muhammad rizky',
    });
  });
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('AddThread Function', () => {
    it('should add thread to database correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'judul thread',
        body: 'isi body',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const { id } = await threadRepositoryPostgres.addThread(newThread, 'user-123');

      // Assert
      const thread = await ThreadsTableTestHelper.findThreadById(id);
      expect(thread).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'judul thread',
        body: 'isi body',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread, 'user-123');

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'judul thread',
        owner: 'user-123',
      }));
    });
  });

  describe('GetThreadById', () => {
    it('should return thread object correctly', async () => {
      // Arrange
      const newThread = {
        id: 'thread-123',
        title: 'judul thread',
        body: 'isi thread',
        date: '20-06-2023',
        owner: 'user-123',
      };
      await ThreadsTableTestHelper.addThread(newThread);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(thread).toStrictEqual({
        id: 'thread-123',
        title: 'judul thread',
        body: 'isi thread',
        date: '20-06-2023',
        username: 'rizky',
      });
    });
  });

  describe('checkAvailabilityThread', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action and Assert
      expect(() => threadRepositoryPostgres.checkAvailabilityThread('thread-321')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread is found', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(threadRepositoryPostgres.checkAvailabilityThread('thread-123')).resolves.not.toThrow(NotFoundError);
    });
  });
});
