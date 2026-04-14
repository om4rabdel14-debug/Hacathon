const locationService = require('./location.service');
const { success } = require('../../core/utils/buildApiResponse');

async function reverseGeocode(req, res) {
  const result = await locationService.getAddressFromCoordinates(req.query);
  res.json(success(result, 'Location resolved successfully'));
}

module.exports = { reverseGeocode };
