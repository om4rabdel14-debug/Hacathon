const { uploadFile } = require('./supabaseStorage.client');
const { generateUniqueFilename } = require('../../core/utils/fileHelpers');

const REPORT_IMAGES_BUCKET = 'report-images';
const RESOLUTION_IMAGES_BUCKET = 'resolution-images';

/**
 * Upload a citizen's report image.
 */
async function uploadReportImage(buffer, mimetype) {
  const filename = generateUniqueFilename(mimetype);
  const path = `reports/${filename}`;
  return uploadFile(REPORT_IMAGES_BUCKET, path, buffer, mimetype);
}

/**
 * Upload a resolution/proof image.
 */
async function uploadResolutionImage(reportId, buffer, mimetype) {
  const filename = generateUniqueFilename(mimetype);
  const path = `resolutions/${reportId}/${filename}`;
  return uploadFile(RESOLUTION_IMAGES_BUCKET, path, buffer, mimetype);
}

module.exports = { uploadReportImage, uploadResolutionImage };
