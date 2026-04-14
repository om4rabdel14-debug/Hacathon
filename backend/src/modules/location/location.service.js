const { reverseGeocode } = require('../../integrations/maps/googleMaps.client');

async function getAddressFromCoordinates({ lat, lng }) {
  const address = await reverseGeocode(lat, lng);

  return {
    lat,
    lng,
    address,
  };
}

module.exports = { getAddressFromCoordinates };
