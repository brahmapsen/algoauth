import React, { useState } from "react";
import { createContainer } from "unstated-next"; // Unstated-next containerization
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "algorand-walletconnect-qrcode-modal";

import { apiGetAccountAssets, apiSubmitTransactions, ChainType } from "../helpers/api";
import { IAssetData, IWalletTransaction, SignTxnParams } from "../helpers/types";


function useAuthAlgo() {

  const [connector, setConnector] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [connected, setConnected] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [address, setAddress] = useState("");
  const [chain, setChain] = useState(ChainType.TestNet);
  const [assets, setAssets] = useState<IAssetData[]>([]);

  const authenticateAlgo = async () => {
      if(!connector) await walletConnectInit();
  }

  const walletConnectInit = async () => {
    // bridge url
    const bridge = "https://bridge.walletconnect.org";

    // create new connector
    const _connector = new WalletConnect({ bridge, qrcodeModal: QRCodeModal });

    await setConnector(_connector);
    console.log("_CONNECTOR", _connector)
    
    // check if already connected
    if (!_connector.connected) {
      // create new session
      console.log('connetor - create a session')
      await _connector.createSession();
    }

    // subscribe to events
   subscribeToEvents(_connector);
  };

  const subscribeToEvents = async (connector) => {
    console.log("Subscribe Event Connector", connector)
    if (!connector) {
      return;
    }

    connector.on("session_update", async (error, payload) => {
      console.log(`connector.on("session_update")`);
      if (error) {
        throw error;
      }
      const { accounts } = payload.params[0];
      onSessionUpdate(accounts);
    });

    connector.on("connect", (error, payload) => {
      console.log(`connector.on("connect")`);
      if (error) {
        throw error;
      }
      onConnect(payload);
    });

    connector.on("disconnect", (error, payload) => {
      console.log(`connector.on("disconnect")`);
      if (error) {
        throw error;
      }
      onDisconnect();
    });

    console.log('if connected, set accounts, address')
    if (connector.connected) {
      const { accounts } = connector;
      const address = accounts[0];

      setAccounts(accounts);
      setAddress(address);
      setConnected(true);

      onSessionUpdate(accounts);
    }

    //this.setState({ connector });
    await setConnector(connector);

  };

  const killSession = async () => {
    if (connector) {
       connector.killSession();
    }
    resetApp();
  };

  const chainUpdate = (newChain) => {
    setChain(newChain);
  };

  const resetApp = async () => {
      setAccounts(null);
      setAddress(null);
      setConnected(false);
  };

  const onConnect = async (payload) => {
    const { accounts } = payload.params[0];
    const address = accounts[0];
    setAccounts(accounts);
    setAddress(address);
    setConnected(true);
  
    //getAccountAssets();
  };

  const onDisconnect = async () => {
    resetApp();
  };

  const onSessionUpdate = async (accounts: string[]) => {
    const address = accounts[0];
    setAddress(address);
    setAccounts(accounts);
    //await getAccountAssets();
  };

  const getAccountAssets = async () => {
    setFetching(true);
    try {
      // get accounts balances
      const assets = await apiGetAccountAssets(chain, address);
      setFetching(false);
      setAssets(assets);
      console.log('Assets:', assets);
    } catch (error) {
      console.error(error);
      setFetching(false);
    }
  };

  return {
    authenticateAlgo,
    address,
    killSession,
    chain,
    connector
  };

}

// Create unstate-next container
const authAlgo = createContainer(useAuthAlgo);
export default authAlgo;