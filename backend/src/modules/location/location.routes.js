const { Router } = require('express');
const validate = require('../../app/middlewares/validate.middleware');
const locationController = require('./location.controller');
const { reverseGeocodeSchema } = require('./location.schemas');

const router = Router();

// GET /api/location/reverse-geocode?lat=...&lng=...
router.get('/reverse-geocode',
  validate(reverseGeocodeSchema, 'query'),
  locationController.reverseGeocode
);

module.exports = router;
