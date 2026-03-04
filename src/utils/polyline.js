/**
 * Decode a Google Maps encoded polyline string into an array of {lat, lng} objects.
 */
export function decodePolyline(enc) {
  const pts = [];
  let idx = 0, lat = 0, lng = 0;
  while (idx < enc.length) {
    let b, shift = 0, result = 0;
    do { b = enc.charCodeAt(idx++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { b = enc.charCodeAt(idx++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : result >> 1;
    pts.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return pts;
}
