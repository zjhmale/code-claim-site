import React, { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import abi from "./utils/bananaPortal.json";

const App = () => {
  /*
   * Just a state variable we use to store our user's public wallet.
   */
  const [currentAccount, setCurrentAccount] = useState("");
  /*
   * All state property to store all msgs
   */
  const [allBananas, setAllBananas] = useState([]);
  /*
   * Create a variable here that holds the contract address after you deploy! Adress taken from terminal.
   */
  const contractAdress = "0x3dCA27B596e8ac8974B4F2e9ff6EB947786F6242";
  const contractABI = abi.abi;

  const getAllMsgs = (async = () => {
    try {
      const { etherium } = window;
      if (etherium) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const bananaPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllMsgs method from your Smart Contract
         */
        const msgs = await bananaPortalContract.getAllMsgs();

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let msgsCleaned = [];
        msgs.forEach((bananaMsg) => {
          msgsCleaned.push({
            address: bananaMsg.monkey,
            timestamp: new Date(bananaMsg.timestamp * 1000),
            message: bananaMsg.message,
          });
        });

        /*
         * Store our data in React State
         */
        setAllBananas(msgsCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  });

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        //user must have connected wallet + authorized acc
        getAllMsgs();
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Connect MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const throwBanana = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        //abi
        const bananaPortalContract = new ethers.Contract(contractAdress, contractABI, signer);

        //execute throw banana
        const bananaTxn = await bananaPortalContract.throwBanana("This is a message");
        console.log("Mining...", bananaTxn.hash);

        await bananaTxn.wait();
        consol.log("Mined --", bananaTxn.hash);

        let count = await bananaPortalContract.getTotalBananas();
        console.log("Retrieved total banana count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">Monke, throw banana 🍌!</div>

        <div className="bio">
          I am Jess and I am studying EE and learning about web3 in my freetime. Connect your
          Ethereum wallet and throw a banana at me!
        </div>

        <button className="waveButton" onClick={throwBanana}>
          Throw a banana at me. 🍌
        </button>

        {/*
         * If there is no currentAccount render this button
         */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Wallet Connected
          </button>
        )}

        {allBananas.map((bananaMsg, index) => {
          return (
            <div
              key={index}
              style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}
            >
              <div>Address: {bananaMsg.address}</div>
              <div>Time: {bananaMsg.timestamp.toString()}</div>
              <div>Message: {bananaMsg.message}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default App;
