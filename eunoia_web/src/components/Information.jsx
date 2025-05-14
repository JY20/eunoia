import React, { useState } from 'react';
import { Box, Typography, Button, Rating, TextField, MenuItem, Switch } from '@mui/material';
import ParamCreator from './paramCreator';

const Information = ({ info, onRunStrategy, strategy, parameters, parameterMap, handleParamChange }) => {
    const [params, setParams] = useState([{ parameter: '', type: '' }]);

  if (!info) return null;

  const { label, cost, creator, rating, description } = info;
  const paramsForStrategy = parameterMap[strategy] || [];

  return (
    <Box
      sx={{
        maxWidth: '100%',
        padding: '20px',
        backgroundColor: '#fafafa',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        height: '80vh',
        overflow: 'auto'
      }}
    >

    {strategy !== 'newStrategy' && (
        <>
          <Typography variant="h4" sx={{ marginBottom: '10px' }}>{label}</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1">Cost: {cost} STRK</Typography>
            <Rating value={rating} precision={0.5} readOnly />
        </Box>
          <Typography variant="body1" sx={{ marginBottom: '10px'}}>Creator: {`${creator.slice(0, 2)}...${creator.slice(-4)}`}</Typography>
          <Typography variant="h7" sx={{ marginBottom: '10px', fontWeight: 'bold'}}>Description:</Typography>
          <Typography variant="body2" sx={{ marginBottom: '10px' }}>{description}</Typography>
          <Typography variant="h7" sx={{ marginBottom: '10px', fontWeight: 'bold'}}>Parameters:</Typography>
        </>
      )}

      {paramsForStrategy.includes('email') && (
        <TextField
          label="Email"
          value={parameters.email || ''}
          onChange={(e) => handleParamChange('email', e.target.value)}
          fullWidth
          required
          sx={{ marginBottom: '20px' }}
          placeholder="Enter Email"
        />
      )}

      {paramsForStrategy.includes('sector') && (
        <TextField
          select
          label="Sector"
          value={parameters.sector || ''}
          onChange={(e) => handleParamChange('sector', e.target.value)}
          fullWidth
          required
          sx={{ marginBottom: '20px' }}
        >
          <MenuItem value="crypto">Crypto</MenuItem>
          <MenuItem value="tsx">TSX Stocks</MenuItem>
          <MenuItem value="sp500">SP500 Stocks</MenuItem>
        </TextField>
      )}

      {paramsForStrategy.includes('symbol') && (
        <TextField
          label="Symbol"
          value={parameters.symbol || ''}
          onChange={(e) => handleParamChange('symbol', e.target.value.toUpperCase())}
          fullWidth
          required
          sx={{ marginBottom: '20px' }}
          disabled={!parameters.sector}
          placeholder="Enter symbol"
        />
      )}

      {paramsForStrategy.includes('openSd') && (
        <TextField
          label="Open Order SD"
          value={parameters.openSd || ''}
          onChange={(e) => handleParamChange('openSd', e.target.value)}
          fullWidth
          required
          sx={{ marginBottom: '20px' }}
        />
      )}

      {paramsForStrategy.includes('closeSd') && (
        <TextField
          label="Close Order SD"
          value={parameters.closeSd || ''}
          onChange={(e) => handleParamChange('closeSd', e.target.value)}
          fullWidth
          required
          sx={{ marginBottom: '20px' }}
        />
      )}

      {paramsForStrategy.includes('isBuy') && (
        <Box sx={{ marginBottom: '20px' }}>
          Is Buy
          <Switch
            checked={parameters.isBuy || false}
            onChange={(e) => handleParamChange('isBuy', e.target.checked)}
            color="primary"
          />
        </Box>
      )}

      {paramsForStrategy.includes('symbol1') && (
        <TextField
          label="Symbol 1"
          value={parameters.symbol1 || ''}
          onChange={(e) => handleParamChange('symbol1', e.target.value.toUpperCase())}
          fullWidth
          required
          sx={{ marginBottom: '20px' }}
          disabled={!parameters.sector || parameters.sector !== 'crypto'}
          placeholder="Enter symbol"
        />
      )}

      {paramsForStrategy.includes('symbol2') && (
        <TextField
          label="Symbol 2"
          value={parameters.symbol2 || ''}
          onChange={(e) => handleParamChange('symbol2', e.target.value.toUpperCase())}
          fullWidth
          required
          sx={{ marginBottom: '20px' }}
          disabled={!parameters.sector || parameters.sector !== 'crypto'}
          placeholder="Enter symbol"
        />
      )}

      {paramsForStrategy.includes('startDate') && (
        <TextField
          type="date"
          label="Start Date"
          InputLabelProps={{ shrink: true }}
          value={parameters.startDate || ''}
          onChange={(e) => handleParamChange('startDate', e.target.value)}
          fullWidth
          required
          sx={{ marginBottom: '20px' }}
        />
      )}

      {paramsForStrategy.includes('endDate') && (
        <TextField
          type="date"
          label="End Date"
          InputLabelProps={{ shrink: true }}
          value={parameters.endDate || ''}
          onChange={(e) => handleParamChange('endDate', e.target.value)}
          fullWidth
          required
          sx={{ marginBottom: '20px' }}
        />
      )}

    
    {paramsForStrategy.includes('address') && (
        <TextField
          label="Wallet Address"
          value={parameters.address || ''}
          onChange={(e) => handleParamChange('address', e.target.value)}
          fullWidth
          required
          sx={{ marginBottom: '20px' }}
          placeholder="0x..."
        />
      )}
      
      {paramsForStrategy.includes('tag') && (
        <TextField
            select
            label="Tag"
            value={parameters.tag || ''}
            onChange={(e) => handleParamChange('tag', e.target.value)}
            fullWidth
            required
            sx={{ marginBottom: '20px' }}
        >
            <MenuItem value="Low Frequency">Low Frequency</MenuItem>
            <MenuItem value="Calculator">Calculator</MenuItem>
        </TextField>
        )}

      {paramsForStrategy.includes('price') && (
        <TextField
          label="Price (STRK)"
          value={parameters.price || ''}
          onChange={(e) => handleParamChange('price', e.target.value)}
          fullWidth
          required
          sx={{ marginBottom: '20px' }}
          placeholder="Enter price"
        />
      )}

      {paramsForStrategy.includes('description') && (
        <TextField
          label="Description"
          value={parameters.description || ''}
          onChange={(e) => handleParamChange('description', e.target.value)}
          fullWidth
          multiline
          rows={3}
          required
          sx={{ marginBottom: '20px' }}
          placeholder="Describe your strategy"
        />
      )}

      {paramsForStrategy.includes('link') && (
        <TextField
          label="GitHub Link"
          value={parameters.link || ''}
          onChange={(e) => handleParamChange('link', e.target.value)}
          fullWidth
          required
          sx={{ marginBottom: '20px' }}
          placeholder="https://github.com/..."
        />
      )}

    {paramsForStrategy.includes('parameters') && (
        <ParamCreator params={params} setParams={setParams}/>
    )}
    <Button
        variant="contained"
        onClick={() => onRunStrategy()}
        sx={{
        backgroundColor: '#7E57C2',
        width: '100%',
        textTransform: 'none',
        '&:hover': {
            backgroundColor: '#673AB7',
        },
        }}
    >
        Run Strategy
    </Button>
    </Box>
  );
};

export default Information;
