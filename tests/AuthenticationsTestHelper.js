/* istanbul ignore file */
const AutheticationTestHelper = {
  async getAccessToken({ server, username = 'rizky' }) {
    /** register user */
    const responseRegister = await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username,
        password: 'secret',
        fullname: 'Muhammad Rizky',
      },
    });

    /** login */
    const responseAuth = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username,
        password: 'secret',
      },
    });
    const { id: userId } = (JSON.parse(responseRegister.payload)).data.addedUser;
    const { accessToken } = (JSON.parse(responseAuth.payload)).data;
    return { userId, accessToken };
  },
};

module.exports = AutheticationTestHelper;
