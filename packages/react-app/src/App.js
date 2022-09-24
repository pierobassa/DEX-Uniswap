import React from "react"
import { useEthers } from "@usedapp/core";

import styles from './styles'
import { uniswapLogo } from './assets'

import { Exchange, WalletButton, Loader } from "./components";

import { usePools } from './hooks';

const App = () => {
  const { account } = useEthers(); //Gives access to the metamask account if it is connected 

  const [loading, pools] = usePools(); //using the hook we created

  console.log("Account: ", account)
  console.log("Pools: ", pools)

  return(
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <header className={styles.header}>
          <img src={uniswapLogo} alt="uniswap logo" className="w-16 h-16 object-contain "/>
          <WalletButton />
        </header>

        <div className={styles.exchangeContainer}>
          <h1 className={styles.headTitle}>Uniswap 2.0 </h1>
          <p className={styles.subTitle }>Post-merge DEX on Goerli</p>

          <div className={styles.exchangeBoxWrapper}>
            <div className={styles.exchangeBox}>
              <div className="pink_gradient" />
              
              {/* Exchange box */}
              <div className={styles.exchange}> 
                {account ? (
                  loading ? <Loader title="Loading LPs, please wait!"/> :  <Exchange pools={pools}/>
                ) 
                : 
                (
                  <Loader title="Please connect your wallet."/>
                )}
              </div>
              <div className="blue_gradient" />
            </div>
          </div>
        </div>  
      </div>
    </div>
  )
}

export default App;