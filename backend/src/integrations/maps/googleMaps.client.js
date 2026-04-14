const config = require('../../config/env');
const logger = require('../../config/logger');

function buildGeocodeUrl(lat, lng) {
  const params = new URLSearchParams({
    latlng: `${lat},${lng}`,
    key: config.googleMapsApiKey,
  });

  return `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`;
}

async function reverseGeocode(lat, lng) {
  if (!config.googleMapsApiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY is not configured');
  }

  const response = await fetch(buildGeocodeUrl(lat, lng), {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Google Maps request failed with status ${response.status}`);
  }

  const data = await response.json();

  if (data.status !== 'OK') {
    if (data.status === 'ZERO_RESULTS') {
      return null;
    }

    throw new Error(data.error_message || `Google Maps geocoding failed with status ${data.status}`);
  }

  const formattedAddress = data.results?.[0]?.formatted_address || null;
  return formattedAddress;
}

async function resolveAddressFromCoordinates(lat, lng) {
  try {
    return await reverseGeocode(lat, lng);
  } catch (error) {
    logger.warn('Failed to reverse geocode report coordinates', {
      lat,
      lng,
      error: error.message,
    });

    return null;
  }
}

module.exports = { reverseGeocode, resolveAddressFromCoordinates };
