const { supabase } = require('../../integrations/database/supabase.client');
const UnauthorizedError = require('../../core/errors/UnauthorizedError');
const logger = require('../../config/logger');

async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    logger.warn('Login failed', { email, error: error.message });
    throw new UnauthorizedError('Invalid email or password');
  }

  logger.info('Admin logged in', { email });

  return {
    user: {
      id: data.user.id,
      email: data.user.email,
    },
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
  };
}

module.exports = { login };
