const { createClient } = require('@supabase/supabase-js');
const config = require('./env');

const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

function getPublicUrl(bucket, filePath) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

module.exports = { supabase, getPublicUrl };
