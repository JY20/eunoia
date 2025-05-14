import React, { useState } from 'react';
import {
  Box, Typography, List, ListItem, ListItemText,
  Tabs, Tab, TableContainer, Table, TableHead, TableRow, TableCell,
  TableBody, Paper
} from '@mui/material';

const ResultsAndHistory = ({ results, history }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        margin: '20px auto',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        height: 'calc(40vh - 16px)'
      }}
    >
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}
        variant="scrollable"
      >
        <Tab label="Results" sx={{ textTransform: 'none', fontSize: '1.1rem', fontWeight: 'bold', color: 'black' }} />
        <Tab label="History" sx={{ textTransform: 'none', fontSize: '1.1rem', fontWeight: 'bold', color: 'black' }} />
      </Tabs>

      {activeTab === 0 && (
        <Box sx={{ marginTop: '20px' }}>
          {results ? (
            typeof results === 'object' ? (
              <List>
                {Object.entries(results).map(([key, value], index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={key.toString()}
                      secondary={value.toString()}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography>{results}</Typography>
            )
          ) : (
            <Typography>No results available.</Typography>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Box sx={{ marginTop: '20px' }}>
          <TableContainer component={Paper} sx={{ height: 250, overflowY: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell><strong>#</strong></TableCell>
                  <TableCell><strong>Strategy</strong></TableCell>
                  <TableCell><strong>Cost (STRK)</strong></TableCell>
                  <TableCell><strong>Time</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history && history.length > 0 ? (
                  history.slice().reverse().map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{history.length - index}</TableCell>
                      <TableCell>{entry.strategy}</TableCell>
                      <TableCell>{entry.amount}</TableCell>
                      <TableCell>{new Date(entry.datetime).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No history available.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default ResultsAndHistory;
