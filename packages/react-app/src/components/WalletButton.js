import React from 'react'

import { useState, useEffect } from 'react'
import { shortenAddress, useEthers, useLookupAddress } from '@usedapp/core'

import styles from '../styles'


const WalletButton = () => {
    const [accountAddress, setAccountAddress] = useState('');

    const { ens } = useLookupAddress();
    const { account, activateBrowserWallet, deactivate } = useEthers();


    useEffect(() => {
        if(ens){
            setAccountAddress(ens);
        }
        else if(account){
            setAccountAddress(shortenAddress(account));
        }
        else {
            setAccountAddress(''); 
        }
    }, [account, ens, setAccountAddress]); //We call this hook whenever one of these 3 changes

    return (
        <button 
            onClick={() => {
                if(!account) { activateBrowserWallet(); }
                else { deactivate(); }
            }}
            className={styles.walletButton}
        >
            {accountAddress === '' ?  "Connect wallet" : accountAddress}
        </button>
    )
}

export default WalletButton