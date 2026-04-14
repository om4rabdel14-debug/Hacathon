const { z } = require('zod');

const reverseGeocodeSchema = z.object({
  lat: z.preprocess((v) => parseFloat(v), z.number().min(-90).max(90)),
  lng: z.preprocess((v) => parseFloat(v), z.number().min(-180).max(180)),
});

module.exports = { reverseGeocodeSchema };
