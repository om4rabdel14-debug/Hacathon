const app = require('./app');
const config = require('../config/env');
const logger = require('../config/logger');

app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
  logger.info(`API available at http://localhost:${config.port}/api`);
});
