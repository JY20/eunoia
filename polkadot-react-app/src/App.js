import React, { useState, useEffect } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import Identicon from '@polkadot/react-identicon';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import abiJson from './eunoia.json'; // your ABI JSON file

function App() {
  const [api, setApi] = useState(null);
  const [chainName, setChainName] = useState('');
  const [accountAddress, setAccountAddress] = useState(null);
  const [isExtensionConnected, setIsExtensionConnected] = useState(false);
  const [balance, setBalance] = useState('0');
  const [contract, setContract] = useState(null);
  const [contractResult, setContractResult] = useState('');
  const [transferAddress, setTransferAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  // extra state for contract payout methods
  const [giveMeAmount, setGiveMeAmount] = useState('');
  const [giveToAddress, setGiveToAddress] = useState('');
  const [giveToAmount, setGiveToAmount] = useState('');

  const [contractBalance, setContractBalance] = useState('0');
  const [depositAmount, setDepositAmount] = useState('');

  const contractAddress = '0x3ecabb141BA7dbb7bb8b2B67B7a60C17dC6edfE1'; // replace with your deployed contract address

  useEffect(() => {
    const connectToPolkadot = async () => {
      const provider = new WsProvider('wss://testnet-passet-hub.polkadot.io');
      const polkadotApi = await ApiPromise.create({ provider });
      setApi(polkadotApi);

      const chain = await polkadotApi.rpc.system.chain();
      setChainName(chain.toString());

      const c = new ContractPromise(polkadotApi, abiJson, contractAddress);
      setContract(c);
    };

    connectToPolkadot();
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      if (api && accountAddress) {
        const { data } = await api.query.system.account(accountAddress);
        setBalance(data.free.toHuman());
      }
    };
    fetchBalance();
  }, [api, accountAddress]);

  const toggleWalletConnection = async () => {
    if (isExtensionConnected) {
      setAccountAddress(null);
      setIsExtensionConnected(false);
    } else {
      try {
        const extensions = await web3Enable('Polkadot React Example');
        if (extensions.length === 0) {
          alert('Polkadot{.js} extension not found. Please install it.');
          return;
        }

        const accounts = await web3Accounts();
        if (accounts.length === 0) {
          alert('No accounts found in the Polkadot{.js} extension.');
          return;
        }

        setAccountAddress(accounts[0].address);
        setIsExtensionConnected(true);
      } catch (error) {
        console.error('Error connecting to wallet:', error);
        alert('Failed to connect to wallet. Please try again.');
      }
    }
  };

  const callContract = async () => {
    try {
      if (!contract || !accountAddress) {
        alert("Contract or account not ready");
        return;
      }

      const gasLimit = api.registry.createType("WeightV2", {
        refTime: 1_000_000_000,
        proofSize: 1_000_000,
      });

      const { result, output } = await contract.query.get(
        accountAddress,
        { value: 0, gasLimit }
      );

      if (result.isOk && output) {
        const value = output.toHuman();
        if (typeof value === "object" && "Ok" in value) {
          setContractResult(value.Ok.toString());
        } else {
          setContractResult(value.toString());
        }
      }
    } catch (err) {
      console.error("Query failed:", err);
      alert("Query failed: " + err.message);
    }
  };

  const flipContract = async () => {
    try {
      if (!contract || !accountAddress) {
        alert("Contract or account not ready");
        return;
      }

      const injector = await web3FromAddress(accountAddress);

      const gasLimit = api.registry.createType("WeightV2", {
        refTime: 2_000_000_000,
        proofSize: 1_000_000,
      });

      const tx = contract.tx.flip({ value: 0, gasLimit });

      await tx.signAndSend(
        accountAddress,
        { signer: injector.signer },
        ({ status }) => {
          if (status.isInBlock) {
            console.log(`flip included in blockHash ${status.asInBlock.toHex()}`);
          } else if (status.isFinalized) {
            console.log(`flip finalized in blockHash ${status.asFinalized.toHex()}`);
            alert("Contract value flipped!");
            callContract();
          }
        }
      );
    } catch (err) {
      console.error("Flip failed:", err);
      alert("Flip failed: " + err.message);
    }
  };

  const giveMe = async () => {
    try {
      if (!contract || !accountAddress || !giveMeAmount) {
        alert("Missing inputs");
        return;
      }

      const injector = await web3FromAddress(accountAddress);

      const gasLimit = api.registry.createType("WeightV2", {
        refTime: 3_000_000_000,
        proofSize: 1_000_000,
      });

      const tx = contract.tx.giveMe({ value: 0, gasLimit }, giveMeAmount);

      await tx.signAndSend(accountAddress, { signer: injector.signer }, ({ status, dispatchError }) => {
        if (dispatchError) {
          console.error("Dispatch error:", dispatchError.toString());
        }
        if (status.isInBlock) {
          console.log("giveMe included in blockHash:", status.asInBlock.toString());
        } else if (status.isFinalized) {
          console.log("giveMe finalized:", status.asFinalized.toString());
          alert(`giveMe executed: received ${giveMeAmount}`);
        }
      });
    } catch (err) {
      console.error("giveMe failed:", err);
      alert("giveMe failed: " + err.message);
    }
  };

  const giveTo = async () => {
    try {
      if (!contract || !accountAddress || !giveToAddress || !giveToAmount) {
        alert("Missing inputs");
        return;
      }

      const injector = await web3FromAddress(accountAddress);

      const gasLimit = api.registry.createType("WeightV2", {
        refTime: 3_000_000_000,
        proofSize: 1_000_000,
      });

      const tx = contract.tx.giveTo({ value: 0, gasLimit }, giveToAddress, giveToAmount);

      await tx.signAndSend(accountAddress, { signer: injector.signer }, ({ status, dispatchError }) => {
        if (dispatchError) {
          console.error("Dispatch error:", dispatchError.toString());
        }
        if (status.isInBlock) {
          console.log("giveTo included in blockHash:", status.asInBlock.toString());
        } else if (status.isFinalized) {
          console.log("giveTo finalized:", status.asFinalized.toString());
          alert(`giveTo executed: sent ${giveToAmount} to ${giveToAddress}`);
        }
      });
    } catch (err) {
      console.error("giveTo failed:", err);
      alert("giveTo failed: " + err.message);
    }
  };

  const getContractBalance = async () => {
    try {
      if (!contract || !accountAddress) return;

      const gasLimit = api.registry.createType("WeightV2", {
        refTime: 1_000_000_000,
        proofSize: 1_000_000,
      });

      const { result, output } = await contract.query.getUserBalance(
        accountAddress,
        { value: 0, gasLimit }
      );

      if (result.isOk && output) {
        const value = output.toHuman();
        if (typeof value === "object" && "Ok" in value) {
          setContractBalance(value.Ok.toString());
        } else {
          setContractBalance(value.toString());
        }
        console.log(value.Ok.toString());
      }
    } catch (err) {
      console.error("get_total_balance failed:", err);
      alert("Failed to fetch contract balance");
    }
  };

  // Call contract deposit
  const depositToContract = async () => {
    try {
      if (!contract || !accountAddress || !depositAmount) {
        alert("Missing deposit amount");
        return;
      }

      const injector = await web3FromAddress(accountAddress);

      const gasLimit = api.registry.createType("WeightV2", {
        refTime: 3_000_000_000,
        proofSize: 1_000_000,
      });

      const tx = contract.tx.deposit({ value: depositAmount, gasLimit });

      await tx.signAndSend(accountAddress, { signer: injector.signer }, ({ status }) => {
        if (status.isInBlock) {
          console.log("Deposit included in block:", status.asInBlock.toString());
        } else if (status.isFinalized) {
          console.log("Deposit finalized:", status.asFinalized.toString());
          alert(`Deposited ${depositAmount} to contract`);
          getContractBalance(); // update contract balance
        }
      });
    } catch (err) {
      console.error("Deposit failed:", err);
      alert("Deposit failed: " + err.message);
    }
  };

  if (!api) {
    return <div>Connecting to Polkadot...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Polkadot React Example</h1>
      <p>Connected to Chain: {chainName}</p>
      
      <button
        onClick={toggleWalletConnection}
        style={{
          padding: '10px 20px',
          backgroundColor: isExtensionConnected ? '#f44336' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px',
        }}
      >
        {isExtensionConnected ? 'Disconnect Wallet' : 'Connect Polkadot Wallet'}
      </button>

      {accountAddress && (
        <>
          <h2>Account Identicon:</h2>
          <Identicon value={accountAddress} size={64} theme="polkadot" />
          <p>Address: {accountAddress}</p>
          <p><b>Balance:</b> {balance}</p>
        </>
      )}

      <button
        onClick={callContract}
        style={{
          padding: '10px 20px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px',
        }}
      >
        Call Contract
      </button>
      <button
        onClick={flipContract}
        style={{
          padding: '10px 20px',
          backgroundColor: '#6f42c1',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '10px',
        }}
      >
        Flip Contract State
      </button>

      {contractResult && (
        <p style={{ marginTop: '15px' }}>Contract Result: {contractResult}</p>
      )}


      <h2 style={{ marginTop: '30px' }}>Contract Payout Methods</h2>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="number"
          placeholder="Amount for giveMe"
          value={giveMeAmount}
          onChange={(e) => setGiveMeAmount(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <button
          onClick={giveMe}
          style={{
            padding: '10px 20px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Call giveMe
        </button>
      </div>

      <div>
        <input
          type="text"
          placeholder="Recipient Address for giveTo"
          value={giveToAddress}
          onChange={(e) => setGiveToAddress(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <input
          type="number"
          placeholder="Amount for giveTo"
          value={giveToAmount}
          onChange={(e) => setGiveToAmount(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <button
          onClick={giveTo}
          style={{
            padding: '10px 20px',
            backgroundColor: '#20c997',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Call giveTo
        </button>
      </div>

      <h2 style={{ marginTop: '30px' }}>Contract Balance & Deposit</h2>
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={getContractBalance}
          style={{ padding: '10px 20px', backgroundColor: '#ffc107', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '10px' }}
        >
          Get Contract Balance
        </button>
        <p>Contract Balance: {contractBalance}</p>

        <input
          type="number"
          placeholder="Amount to deposit"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <button
          onClick={depositToContract}
          style={{ padding: '10px 20px', backgroundColor: '#fd7e14', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Deposit
        </button>
      </div>

    </div>
  );
}

export default App;
