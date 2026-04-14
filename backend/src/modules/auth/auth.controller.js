const authService = require('./auth.service');
const { success } = require('../../core/utils/buildApiResponse');

async function login(req, res) {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json(success(result, 'Login successful'));
}

module.exports = { login };
