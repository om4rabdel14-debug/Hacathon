const { supabase } = require('../../config/supabase');
const logger = require('../../config/logger');

/**
 * Upload a file buffer to a Supabase storage bucket.
 *
 * @param {string} bucket - Bucket name
 * @param {string} path - File path within the bucket
 * @param {Buffer} buffer - File buffer
 * @param {string} contentType - MIME type
 * @returns {string} Public URL of the uploaded file
 */
async function uploadFile(bucket, path, buffer, contentType) {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    logger.error('Supabase storage upload failed', { bucket, path, error: error.message });
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete a file from a Supabase storage bucket.
 */
async function deleteFile(bucket, path) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    logger.warn('Failed to delete file from storage', { bucket, path, error: error.message });
  }
}

module.exports = { uploadFile, deleteFile };
