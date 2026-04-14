const { v4: uuidv4 } = require('uuid');

const MIME_TO_EXT = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

function getExtFromMimetype(mimetype) {
  return MIME_TO_EXT[mimetype] || 'jpg';
}

function generateUniqueFilename(mimetype) {
  const ext = getExtFromMimetype(mimetype);
  return `${uuidv4()}.${ext}`;
}

module.exports = { getExtFromMimetype, generateUniqueFilename };
