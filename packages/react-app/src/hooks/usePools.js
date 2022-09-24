import Web3 from 'web3';
import { useState, useEffect } from 'react';
import { useConfig } from '@usedapp/core';

import { ROUTER_ADDRESS } from '../config';

import { getFactoryInfo, getRouterInfo } from '../utils';

export const loadPools = async (providerUrl) => {
    const provider = new Web3.providers.HttpProvider(providerUrl);
    const web3 = new Web3(provider); 

    console.log("WEB3: ", web3)
    console.log("Accounts: ", web3.eth.getAccounts[0])

    //Now we can grab the Router info and Factory info
    const routerInfo = await getRouterInfo(ROUTER_ADDRESS, web3); //We wait for the async call to finish so we store the result without proceeding before it ends
    const factoryInfo = await getFactoryInfo(routerInfo.factory, web3);

    return factoryInfo.pairsInfo;
}

export const usePools = () => {
    const { readOnlyChainId, readOnlyUrls } = useConfig(); //Reading from config.js
    
    const [loading, setLoading] = useState(true);

    const [pools, setPools] = useState({}); //initialized to an empty object

    console.log("providerUrl:", readOnlyUrls[readOnlyChainId])

    useEffect(() => {
        loadPools(readOnlyUrls[readOnlyChainId]).then((pools) => {
            setPools(pools);
            setLoading(false); 
        })
    }, [readOnlyUrls, readOnlyChainId]);

    return [loading, pools]; //returning an array of loading and the pools object 
}