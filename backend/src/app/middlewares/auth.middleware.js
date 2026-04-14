const { supabase } = require('../../config/supabase');
const UnauthorizedError = require('../../core/errors/UnauthorizedError');

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  const token = authHeader.split(' ')[1];

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw new UnauthorizedError('Invalid or expired token');
  }

  req.user = data.user;
  next();
}

module.exports = { requireAuth };
