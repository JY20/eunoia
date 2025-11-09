import React, { useMemo } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Styled map container wrapper
const MapWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '350px',
  width: '100%',
  borderRadius: '12px',
  overflow: 'hidden',
  '& .leaflet-container': {
    height: '100%',
    width: '100%',
    borderRadius: '12px',
    zIndex: 0
  }
}));

// Legend overlay
const MapLegend = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  bottom: '10px',
  left: '10px',
  zIndex: 1000,
  padding: theme.spacing(1.5),
  backgroundColor: alpha(theme.palette.background.paper, 0.95),
  backdropFilter: 'blur(8px)',
  borderRadius: '8px',
  maxWidth: '250px',
  boxShadow: theme.shadows[3],
}));

// Geocoding database - Maps locations to coordinates
const LOCATION_COORDINATES = {
  // Countries
  'Uganda': { lat: 1.3733, lng: 32.2903, name: 'Uganda' },
  'Kenya': { lat: -0.0236, lng: 37.9062, name: 'Kenya' },
  'Tanzania': { lat: -6.3690, lng: 34.8888, name: 'Tanzania' },
  'Rwanda': { lat: -1.9403, lng: 29.8739, name: 'Rwanda' },
  'Ethiopia': { lat: 9.1450, lng: 40.4897, name: 'Ethiopia' },
  'Ghana': { lat: 7.9465, lng: -1.0232, name: 'Ghana' },
  'Nigeria': { lat: 9.0820, lng: 8.6753, name: 'Nigeria' },
  'South Africa': { lat: -30.5595, lng: 22.9375, name: 'South Africa' },
  'India': { lat: 20.5937, lng: 78.9629, name: 'India' },
  'Bangladesh': { lat: 23.6850, lng: 90.3563, name: 'Bangladesh' },
  'Nepal': { lat: 28.3949, lng: 84.1240, name: 'Nepal' },
  'Philippines': { lat: 12.8797, lng: 121.7740, name: 'Philippines' },
  'Indonesia': { lat: -0.7893, lng: 113.9213, name: 'Indonesia' },
  'Brazil': { lat: -14.2350, lng: -51.9253, name: 'Brazil' },
  'Peru': { lat: -9.1900, lng: -75.0152, name: 'Peru' },
  'Colombia': { lat: 4.5709, lng: -74.2973, name: 'Colombia' },
  'Mexico': { lat: 23.6345, lng: -102.5528, name: 'Mexico' },
  'Haiti': { lat: 18.9712, lng: -72.2852, name: 'Haiti' },
  
  // Cities
  'Kampala': { lat: 0.3476, lng: 32.5825, name: 'Kampala, Uganda' },
  'Nairobi': { lat: -1.2864, lng: 36.8172, name: 'Nairobi, Kenya' },
  'Mombasa': { lat: -4.0435, lng: 39.6682, name: 'Mombasa, Kenya' },
  'Dar es Salaam': { lat: -6.7924, lng: 39.2083, name: 'Dar es Salaam, Tanzania' },
  'Kigali': { lat: -1.9706, lng: 30.1044, name: 'Kigali, Rwanda' },
  'Addis Ababa': { lat: 9.0320, lng: 38.7469, name: 'Addis Ababa, Ethiopia' },
  'Accra': { lat: 5.6037, lng: -0.1870, name: 'Accra, Ghana' },
  'Lagos': { lat: 6.5244, lng: 3.3792, name: 'Lagos, Nigeria' },
  'Mumbai': { lat: 19.0760, lng: 72.8777, name: 'Mumbai, India' },
  'Dhaka': { lat: 23.8103, lng: 90.4125, name: 'Dhaka, Bangladesh' },
  'Manila': { lat: 14.5995, lng: 120.9842, name: 'Manila, Philippines' },
  
  // Regions
  'East Africa': { lat: -1.2921, lng: 36.8219, name: 'East Africa' },
  'West Africa': { lat: 7.5400, lng: -5.5471, name: 'West Africa' },
  'Southern Africa': { lat: -25.7461, lng: 28.1881, name: 'Southern Africa' },
  'South Asia': { lat: 23.0000, lng: 80.0000, name: 'South Asia' },
  'Southeast Asia': { lat: 15.0000, lng: 105.0000, name: 'Southeast Asia' },
  'Latin America': { lat: -8.7832, lng: -55.4915, name: 'Latin America' },
  'Central America': { lat: 15.0000, lng: -90.0000, name: 'Central America' },
  
  // Default fallback
  'Global': { lat: 20.0, lng: 0.0, name: 'Global' },
};

// Function to extract location from charity data
const extractLocation = (charity) => {
  const text = `${charity.name} ${charity.description}`.toLowerCase();
  
  // Try to find specific location matches
  for (const [key, value] of Object.entries(LOCATION_COORDINATES)) {
    if (text.includes(key.toLowerCase())) {
      return { ...value, charityName: charity.name, charityId: charity.id };
    }
  }
  
  // Check for Africa mentions
  if (text.includes('africa')) {
    return { ...LOCATION_COORDINATES['East Africa'], charityName: charity.name, charityId: charity.id };
  }
  
  // Default to Global
  return { ...LOCATION_COORDINATES['Global'], charityName: charity.name, charityId: charity.id };
};

const ImpactMap = ({ charities }) => {
  const locations = useMemo(() => {
    if (!charities || charities.length === 0) return [];
    return charities.map(charity => extractLocation(charity));
  }, [charities]);

  // Calculate center and zoom based on locations
  const { center, zoom } = useMemo(() => {
    if (locations.length === 0) {
      return { center: [20, 0], zoom: 2 };
    }
    
    const avgLat = locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
    const avgLng = locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length;
    
    // Calculate bounds to determine zoom
    const lats = locations.map(l => l.lat);
    const lngs = locations.map(l => l.lng);
    const latRange = Math.max(...lats) - Math.min(...lats);
    const lngRange = Math.max(...lngs) - Math.min(...lngs);
    const maxRange = Math.max(latRange, lngRange);
    
    let calculatedZoom = 2;
    if (maxRange < 5) calculatedZoom = 6;
    else if (maxRange < 15) calculatedZoom = 5;
    else if (maxRange < 30) calculatedZoom = 4;
    else if (maxRange < 60) calculatedZoom = 3;
    
    return { center: [avgLat, avgLng], zoom: calculatedZoom };
  }, [locations]);

  // Group locations by coordinates to avoid overlapping markers
  const groupedLocations = useMemo(() => {
    const groups = new Map();
    locations.forEach(loc => {
      const key = `${loc.lat.toFixed(2)},${loc.lng.toFixed(2)}`;
      if (!groups.has(key)) {
        groups.set(key, { ...loc, charities: [loc.charityName] });
      } else {
        groups.get(key).charities.push(loc.charityName);
      }
    });
    return Array.from(groups.values());
  }, [locations]);

  if (!charities || charities.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 2, borderRadius: '8px', textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          No locations to display on map.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <MapWrapper>
        <MapContainer 
          center={center} 
          zoom={zoom} 
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {groupedLocations.map((location, index) => (
            <React.Fragment key={`${location.lat}-${location.lng}-${index}`}>
              {/* Highlight circle for impact area */}
              <Circle
                center={[location.lat, location.lng]}
                radius={100000} // 100km radius
                pathOptions={{
                  color: '#4cc9f0',
                  fillColor: '#4cc9f0',
                  fillOpacity: 0.15,
                  weight: 2,
                }}
              />
              
              {/* Marker for the location */}
              <Marker position={[location.lat, location.lng]}>
                <Popup>
                  <Box sx={{ minWidth: '150px' }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      {location.name}
                    </Typography>
                    <Typography variant="caption" component="div">
                      <strong>Charities:</strong>
                    </Typography>
                    {location.charities.map((charityName, idx) => (
                      <Chip
                        key={idx}
                        label={charityName}
                        size="small"
                        sx={{ mt: 0.5, mr: 0.5, fontSize: '0.65rem' }}
                      />
                    ))}
                  </Box>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}
        </MapContainer>
        
        <MapLegend elevation={3}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mb: 1 }}>
            Impact Regions
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {groupedLocations.slice(0, 3).map((location, index) => (
              <Chip 
                key={index}
                label={location.name} 
                size="small" 
                variant="outlined"
                color="primary"
                sx={{ fontSize: '0.7rem', justifyContent: 'flex-start' }}
              />
            ))}
            {groupedLocations.length > 3 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                +{groupedLocations.length - 3} more regions
              </Typography>
            )}
          </Box>
        </MapLegend>
      </MapWrapper>
    </Box>
  );
};

export default ImpactMap;
