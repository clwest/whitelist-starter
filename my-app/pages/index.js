import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import {providers, Contract} from "ethers";
import {useEffect, useRef, useState} from "react";
import {WHITELIST_CONTRACT_ADDRESS, abi} from "../constants";

export default function Home() {
  // Connect wallet
  const [walletConnected, setWalletConnected] = useState(false);
  
  // Track if address has joined the whitelist
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);

  // set loading to true while transaction is being mined
  const [loading, setLoading] = useState(false);

  // check the number of addresses whitelist
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);

  // Create a MM connection point
  const web3ModalRef = useRef();

  const getProviderOrSigner = async (needSigner = false) => {

    // Connect to MM
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // Alerts user to connect to Goerli testnet
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Please connect to the Goerli testnet");
      throw new Error("Change network to Goerli testnet");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  // Add currently listed address to whitelist

  const addAddressToWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the contract with a Signer object

      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );

      // call addAddressToWhitelist
      const tx = await whitelistContract.addAddressToWhitelist();
      setLoading(true);

      // Wait for the transaction to be mined
      await tx.wait();
      setLoading(false);

      // get Updated number of addresses added to contracts
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    } catch (error) {
      console.log(error);
    }

  };

  // Get the number of addresses whitelisted

  const getNumberOfWhitelisted = async () => {
    try {
      // get provider from web3Modal
      const provider = await getProviderOrSigner();
       // connect to the contract using provider giving read-only access
      const whitelistContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, provider);

      // call numAddressesWhitelisted from contract
      const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
      setNumberOfWhitelisted(_numberOfWhitelisted);
    } catch (err) {
      console.error(err);
    }
  }

  // check if address is whitelisted

  const checkIfAddressInWhitelist = async () => {
    try {
      // get the signer from web3Modal
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, signer);

      // get the address associated to the signer which is connected to MM
      const address = await signer.getAddress();
      // call the whitelisedAddress from contracts
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(address);
      setJoinedWhitelist(_joinedWhitelist);
    } catch (err) {
      console.error(err);
    };
  }

  // Connect to MM

  const connectWallet = async () => {
    try {
      // get provider from MM
      await getProviderOrSigner();
      setWalletConnected(true);

      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    } catch(err) {
      console.error(err);
    }
  }

  // Returns a button based on state

  const renderButton = () => {
    if (walletConnected) {
      if(joinedWhitelist) {
        return (
          <div className={styles.description}>
            Thanks for joining the Whitelist!
          </div>
        )
      } else if (loading) {
        return <button className={styles.button}>Loading...</button>
      } else {
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join the Whitelist
          </button>
        )
      } 
      }else {
        return (
          <button onClick={connectWallet} className={styles.button}>
            Connect your Wallet
          </button>
        )
    }
  }

  // useEffect that will be triggered whenever a new MM account connects to the dapp
  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: 'rinkeby',
        providerOptions: {},
        disableInjectedProvider: false
      })
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>Whitelist</title>
        <meta name="description" content="Whitelist-Dapp" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT for developers in Crypto
          </div>
          <div className={styles.description}>
            {numberOfWhitelisted} have already joined the Whitelist list
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src='./crypto-devs.svg' />
      </div>
    </div>
    <footer className={styles.footer}>
      Made with &#10084; by Crypto Devs
    </footer>
  </div>
  )


}