import React from 'react';
import { Box, Button, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const getTagColor = (tag) => {
  switch (tag) {
    case 'Low Frequency':
      return { bg: '#E0BBE4', color: '#000000' };
    case 'Calculator':
      return { bg: '#C5CAE9', color: '#000000' };
    default:
      return { bg: '#E0E0E0', color: '#000000' };
  }
};

const Selection = ({ selections, onSelect }) => {
  return (
    <Box
      sx={{
        padding: '20px',
        borderRadius: '12px',
        height: '40vh',
        backgroundColor: '#F3F0FA',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => onSelect({ value: 'newStrategy' })}
          sx={{
            backgroundColor: '#7E57C2',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#673AB7',
            },
          }}
        >
          Create Strategy
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: '30vh', overflowY: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell><strong>#</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Tag</strong></TableCell>
              <TableCell><strong>Cost (STRK)</strong></TableCell>
              <TableCell><strong>Creator</strong></TableCell>
              <TableCell align="center"><strong>Select</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selections.map((item, index) => {
              const { bg, color } = getTagColor(item.tags);
              return (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.label}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.tags}
                      size="small"
                      sx={{
                        backgroundColor: bg,
                        color: color,
                        fontWeight: 'bold',
                      }}
                    />
                  </TableCell>
                  <TableCell>{item.cost}</TableCell>
                  <TableCell>{`${item.creator.slice(0, 2)}...${item.creator.slice(-4)}`}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      onClick={() => onSelect(item)}
                      sx={{
                        backgroundColor: '#7E57C2',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: '#673AB7',
                        },
                      }}
                    >
                      Select
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Selection;
