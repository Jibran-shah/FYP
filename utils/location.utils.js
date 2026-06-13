/* =========================
   LOCATION UTILS
========================= */

/**
 * Validate [longitude, latitude]
 */
export const isValidCoordinates = (lng, lat) => {
  const longitude = Number(lng);
  const latitude = Number(lat);

  return (
    Number.isFinite(longitude) &&
    Number.isFinite(latitude) &&
    longitude >= -180 &&
    longitude <= 180 &&
    latitude >= -90 &&
    latitude <= 90
  );
};

/**
 * Build GeoJSON coordinates
 */
export const buildCoordinates = (lng, lat) => {
  if (!isValidCoordinates(lng, lat)) {
    return undefined;
  }

  return [Number(lng), Number(lat)];
};

/**
 * Build location object
 *
 * Returns:
 * - undefined when no usable location data exists
 * - valid GeoJSON location otherwise
 */
export const buildLocation = (
  lng,
  lat,
  fullAddress
) => {
  const location = {};

  const coordinates = buildCoordinates(lng, lat);

  if (coordinates) {
    location.coordinates = coordinates;
  }

  if (fullAddress?.trim()?.length) {
    location.fullAddress = fullAddress.trim();
  }

  return Object.keys(location).length
    ? location
    : undefined;
};

/**
 * Extract coordinates from location
 */
export const getCoordinates = (location) => {
  const coordinates = location?.coordinates;

  if (
    !Array.isArray(coordinates) ||
    coordinates.length !== 2
  ) {
    return null;
  }

  const [lng, lat] = coordinates;

  if (!isValidCoordinates(lng, lat)) {
    return null;
  }

  return {
    lng: Number(lng),
    lat: Number(lat)
  };
};

/**
 * Check if location contains valid geo coordinates
 */
export const hasGeoLocation = (location) => {
  return getCoordinates(location) !== null;
};

/**
 * Build MongoDB $near query
 */
export const buildGeoNearQuery = (lng, lat, radius) => {
  const coordinates = buildCoordinates(lng, lat);
  const maxDistance = Number(radius);

  if (
    !coordinates ||
    !Number.isFinite(maxDistance) ||
    maxDistance <= 0
  ) {
    return null;
  }

  return {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates
        },
        $maxDistance: maxDistance
      }
    }
  };
};