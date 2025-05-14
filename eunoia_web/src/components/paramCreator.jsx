import React, { useState } from 'react';
import { Box, IconButton, TextField, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const ParamCreator = ({params, setParams}) => {

  const handleAdd = () => {
    setParams([...params, { parameter: '', type: '' }]);
  };

  const handleChange = (index, key, value) => {
    const updated = [...params];
    updated[index][key] = value;
    setParams(updated);
  };

  return (
    <Stack spacing={2} sx={{marginBottom: '20px'}}>
      {params.map((param, index) => (
        <Box key={index} display="flex" alignItems="center" gap={2}>
          <IconButton onClick={handleAdd} sx={{ border: '1px solid #ccc' }}>
            <AddIcon />
          </IconButton>

          <TextField
            label="Parameter"
            value={param.parameter}
            onChange={(e) => handleChange(index, 'parameter', e.target.value)}
            sx={{ flex: 1 }}
          />

          <TextField
            label="Type"
            value={param.type}
            onChange={(e) => handleChange(index, 'type', e.target.value)}
            sx={{ flex: 1 }}
          />
        </Box>
      ))}
    </Stack>
  );
};

export default ParamCreator;
