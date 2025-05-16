import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

// Styled map container
const MapContainer = styled(Paper)(({ theme }) => ({
  position: 'relative',
  height: '300px',
  width: '100%',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundImage: 'url("https://images.unsplash.com/photo-1530056046039-5488bdcc0de6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: alpha(theme.palette.common.black, 0.4),
    zIndex: 1
  }
}));

// Location marker component
const ImpactMarker = styled(Paper)(({ theme, color = 'primary.main' }) => ({
  position: 'absolute',
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  backgroundColor: theme.palette[color.split('.')[0]][color.split('.')[1] || 'main'],
  border: `2px solid ${theme.palette.common.white}`,
  transform: 'translate(-50%, -50%)',
  zIndex: 2,
  cursor: 'pointer',
  boxShadow: theme.shadows[2],
  '&:hover': {
    transform: 'translate(-50%, -50%) scale(1.5)',
    transition: 'transform 0.2s ease-in-out',
  },
}));

// Legend overlay
const MapLegend = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  padding: theme.spacing(1.5),
  backgroundColor: alpha(theme.palette.background.paper, 0.85),
  backdropFilter: 'blur(4px)',
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
}));

// Mock geocoding function - Simplified coordinates for visual placement only
const MOCK_GEOCODES = {
  'Hope Uganda Initiative': { x: 62, y: 42, name: 'Kampala, Uganda' },
  "African Children's Fund": { x: 65, y: 48, name: 'Nairobi, Kenya' },
  'Faithful Scholars Africa': { x: 67, y: 52, name: 'Mombasa, Kenya' },
  'default': { x: 55, y: 45 }
};

const getGeocode = (charityName, charityDescription) => {
  if (MOCK_GEOCODES[charityName]) {
    return MOCK_GEOCODES[charityName];
  }
  if (charityDescription && charityDescription.toLowerCase().includes('uganda')) {
    return MOCK_GEOCODES['Hope Uganda Initiative'];
  }
  return MOCK_GEOCODES['default']; 
};

const ImpactMap = ({ charities }) => {
  if (!charities || charities.length === 0) {
    return <Typography variant="caption">No locations to display on map.</Typography>;
  }

  return (
    <MapContainer elevation={2}>
      {/* Place markers */}
      {charities.map((charity, index) => {
        const location = getGeocode(charity.name, charity.description);
        return (
          <ImpactMarker 
            key={charity.id || index}
            color={index === 0 ? 'primary.main' : index === 1 ? 'secondary.main' : 'success.main'} 
            sx={{ 
              top: `${location.y}%`, 
              left: `${location.x}%`,
            }}
          />
        );
      })}
      
      {/* Legend */}
      <MapLegend>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Your Impact Regions
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {charities.map((charity, index) => {
            const location = getGeocode(charity.name, charity.description);
            return (
              <Chip 
                key={charity.id || index}
                label={location.name || 'Impact Area'} 
                size="small" 
                variant="outlined"
                sx={{ borderRadius: '16px', fontSize: '0.7rem' }}
              />
            );
          })}
        </Box>
      </MapLegend>
    </MapContainer>
  );
};

export default ImpactMap; 