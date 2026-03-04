export function darkStyle() {
  return [
    { elementType: 'geometry', stylers: [{ color: '#1a2220' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#6b8a82' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0b0f0e' }] },
    { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2a3a36' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a3a36' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0b0f0e' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3a4e48' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#FF2C2C' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1e1a' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d5a52' }] },
    { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#131918' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1a2e28' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0f2018' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1e2e2a' }] },
  ];
}

export function nightStyle() {
  return [
    { elementType: 'geometry', stylers: [{ color: '#0d1321' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#5a6a9a' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#060c18' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2040' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#283060' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#00c9ff' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#071020' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#1a3a5c' }] },
    { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#0a1020' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#0f1a30' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#081828' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#0d1828' }] },
    { featureType: 'administrative.land_parcel', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  ];
}

export function silverStyle() {
  return [
    { elementType: 'geometry', stylers: [{ color: '#f0f0f0' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e0e0e0' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#b0b0b0' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#333333' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9e8f0' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#5a8a9f' }] },
    { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#e8e8e8' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#d8eddb' }] },
    { featureType: 'transit.line', elementType: 'geometry', stylers: [{ color: '#e0e0e0' }] },
  ];
}

export function getStyle(theme) {
  switch (theme) {
    case 'dark': return darkStyle();
    case 'night': return nightStyle();
    case 'silver': return silverStyle();
    case 'light':
    default: return [];
  }
}
