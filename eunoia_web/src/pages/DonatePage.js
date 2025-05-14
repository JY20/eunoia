import React, { useState, useContext, useEffect} from 'react';
import { Box, Grid, Stack} from '@mui/material';
import axios from 'axios';
import {AppContext} from '../components/AppProvider';
import { Connected} from '../components/Alert';
import Loading from '../components/Loading';
import { AppContract } from '../components/AppContract';
import Result from '../components/Result';
import Information from '../components/Information';
import Selection from '../components/Selection';
import data from "../assets/data.json";

const DonatePage = () => {
  const [strategy, setStrategy] = useState(data[0].value);
  const [results, setResults] = useState(null);

  const [loading, setLoading] = useState(false)
  const [strategies, setStrategies] = useState(data);
  const [selectedInfo, setSelectedInfo] = useState(data[0]);
  const [history, setHistory] = useState([]);


  const host = "http://localhost:8080";

  const parameterMap = {
    newStrategy: ['email', 'address', 'price', 'tag', 'description', 'link', 'parameters'],
    averageRebalance: ['sector', 'email'],
    momentum: ['sector', 'email'],
    standardDeviation: ['sector', 'symbol', 'openSd', 'closeSd', 'isBuy'],
    coVariance: ['symbol1', 'symbol2', 'startDate', 'endDate'],
  };

  const [parameters, setParameters] = useState({});
  const info = useContext(AppContext);
  const contract =  new AppContract();

  const handleParamChange = (param, value) => {
    setParameters((prev) => ({ ...prev, [param]: value }));
  };

  const handleRun = async (strategy) => {
      try {
          const result = "test";
          // await contract.run_strategy(info.wallet.account, strategy, selectedInfo.cost);
          console.log("Run Strategy Result:", result);
      } catch (error) {
          console.error("An error occurred during the run strategy process:", error);

          if (error.message.includes("User abort")) {
              alert("Transaction aborted by user.");
          } else {
              alert("An unexpected error occurred. Please try again.");
          }
      }
  };

  const handleSelect = (item) => {
    setStrategy(item.value);
    const index = data.findIndex(strategy => strategy.value === item.value);
    setSelectedInfo(data[index]);
    console.log(`You selected the strategy: ${item.value} at index: ${index}`);
  };

  const refreshData = async () => {
    // const values = await contract.getUserHistory(info.walletAddress);

    // setHistory(values);
    info.setRouteTrigger(true);
  };

  const handleRunStrategy = async () => {
    if (!strategy) {
      alert('Please select a strategy.');
      return;
    }
  
    setLoading(true);
    await handleRun(strategy);
  
    try {
      let result;
      switch (strategy) {
        case 'averageRebalance':
          console.log('Running Average Rebalance strategy');
          break;
  
        case 'momentum':
          console.log('Running Momentum strategy');
          break;
  
        case 'standardDeviation':
          console.log('Running Standard Deviation strategy');
          break;
  
        case 'coVariance':
          console.log('Running Co-Variance strategy');
          break;
  
        default:
          console.error('Unknown strategy selected.');
          return;
      }
  
      setResults(result);
      alert(`Strategy Runned: ${strategy}`);

      await refreshData();
    } catch (error) {
      console.error('Error running strategy:', error);
      alert('An error occurred while starting the algorithm. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (info.walletAddress && !info.routeTrigger) {
        refreshData();
    }
  }, [info, refreshData]);

  if(info.walletAddress != null){
    return (
      <Box sx={{ fontFamily: "Arial, sans-serif", backgroundColor: "#D1C4E9", padding: "10px" }}>
        <Grid container spacing={2}>
          <Grid size={8}>
            <Stack spacing={2}>
              <Selection selections={strategies} onSelect={handleSelect} />
              <Result results={results}  history={history}/>
            </Stack>
          </Grid>
          <Grid size={4}>
            <Information info={selectedInfo} onRunStrategy={handleRunStrategy} strategy={strategy} parameters={parameters} parameterMap={parameterMap} handleParamChange={handleParamChange} />
          </Grid>
        </Grid>
      </Box>
    );
  }else{
      return <Connected/>
  }
};

export default DonatePage;