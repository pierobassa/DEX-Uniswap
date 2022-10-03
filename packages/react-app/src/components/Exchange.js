import React, { useEffect } from 'react'
import { useState } from 'react'
import { Contract } from '@ethersproject/contracts'
import { abis } from '@my-app/contracts'
import { ERC20, useContractFunction, useEthers, useTokenAllowance, useTokenBalance } from '@usedapp/core'
import { ethers } from 'ethers' 
import { parseUnits } from 'ethers/lib/utils'

import { ROUTER_ADDRESS } from '../config'

import { AmountIn, AmountOut, Balance } from './';

import styles from '../styles'

import { getAvailableTokens, getCounterpartTokens, findPoolByTokens, isOperationPending, getFailureMessage, getSuccessMessage } from '../utils'

const Exchange = ({pools}) => {
  const { account } = useEthers();

  const [fromValue, setFromValue] = useState("0"); //amount of tokens in the from that the account has
  const [fromToken, setFromToken] = useState(pools[0].token0Address);
  const [toToken, setToToken] = useState("")
  const [resetState, setResetState] = useState(false); //To reset the success message

  const fromValueBigNumber = parseUnits(fromValue || "0");
  const availableTokens = getAvailableTokens(pools);
  const counterpartTokens = getCounterpartTokens(pools, fromToken);
  const pairAddress = findPoolByTokens(pools, fromToken, toToken)?.address ?? ""; // ? after a function means if it returns something then proceed with what's after the '?'. In this case we get the address
                                                                                  // '??' checks if the result is null or undefined. if it is, it assigns ""

  const routerContract = new Contract(ROUTER_ADDRESS, abis.router02);
  const fromTokenContract = new Contract(fromToken, ERC20.abi);
  
  const fromTokenBalance = useTokenBalance(fromToken, account);
  const toTokenBalance = useTokenBalance(toToken, account);

  const tokenAllowance = useTokenAllowance(fromToken, account, ROUTER_ADDRESS) || parseUnits("0"); 
  const approveNeeded = fromValueBigNumber.gt(tokenAllowance); //if the from value is >= tokenAllowance, then we need to approve the token swap
  
  const fromValueIsGreaterThan0 = fromValueBigNumber.gt(parseUnits("0"));

  const hasEnoughBalance = fromValueBigNumber.lte(fromTokenBalance ?? parseUnits("0")); // ?? checks if the variable on the left is null or undefined. If it is, it performs what's after the '??' 

  //https://docs.openzeppelin.com/contracts/2.x/api/token/erc20
  const {state: swapApproveState, send: swapApproveSend} = useContractFunction(
                                                                      fromTokenContract, 
                                                                      "approve", 
                                                                      {
                                                                        transactionName: "onApproveRequested", 
                                                                        gasLimitBufferPercentage: 10,
                                                                      }
                                                                    ); //useContractFunction allows us to call contract functions. We rename state to swapApproveState & send to swapApproveSend

  //https://docs.uniswap.org/protocol/V2/reference/smart-contracts/router-02                                                          
  const {state: swapExecuteState, send: swapExecuteSend} = useContractFunction(
                                                                      routerContract, 
                                                                      "swapExactTokensForTokens", 
                                                                      {
                                                                        transactionName: "swapExactTokensForTokens", 
                                                                        gasLimitBufferPercentage: 10,
                                                                      }
                                                                    ); //useContractFunction allows us to

  const isApproving = isOperationPending(swapApproveState);
  const isSwapping = isOperationPending(swapExecuteState);
  
  const canApprove = !isApproving && approveNeeded; //We can approve if we are not currently approving and approve is needed
  const canSwap = !approveNeeded && !isSwapping && fromValueIsGreaterThan0 && hasEnoughBalance;

  const successMessage = getSuccessMessage(swapApproveState, swapExecuteState);
  const failureMessage = getFailureMessage(swapApproveState, swapExecuteState);

  const onApproveRequested = ()  => {
    swapApproveSend(ROUTER_ADDRESS, ethers.constants.MaxUint256); //we are approving to send the maximum uint possible so that we don't have to always approve again if we want to swap a greater amount
  }

  console.log(fromValueBigNumber.toString())

  //swapExecuteSend is the function "sawpExactTokensForTokens" of the Router 02 of Uniswap. It has these parameters:
  // uint amountIn,
  // uint amountOutMin,
  // address[] calldata path,
  // address to,
  // uint deadline
  const onSwapRequested = () => {
    swapExecuteSend(
      fromValueBigNumber, //amountIn
      0, //amountOutMin
      [fromToken, toToken], //path
      account, //to
      Math.floor(Date.now() / 1000) + 60 * 2 //deadline of 2 minutes
    ).then(() => {
      setFromValue("0")
    });
  }

  const onFromValueChange = (value) => {
    const trimmedValue = value.trim();

    try{
      if(trimmedValue){
        parseUnits(value);
        setFromValue(value);
      }
    } catch(error){
      console.log(error);
    }
  }

  const onFromTokenChange = (value) => {
    setFromToken(value);
  }

  const onToTokenChange = (value) => {
    setToToken(value);
  }

  useEffect(() => {
    if(failureMessage || successMessage){
      setTimeout(() => { //Built-in function
        setResetState(true);
        setFromValue("0");
        setToToken("");
      }, 10000); //     
    }
  }, [failureMessage, successMessage])

  return (
    <div className='flex flex-col w-full items-center'>
        <div className='mb-8'>
          <AmountIn value={fromValue} onChange={onFromValueChange} currencyValue={fromToken} onSelect={onFromTokenChange} currencies={availableTokens} isSwapping={isSwapping && hasEnoughBalance} />
          <Balance tokenBalance={fromTokenBalance} />
        </div>
        <div className='mb-8 w-[100%]'>
          <AmountOut fromToken={fromToken} toToken={toToken} amountIn={fromValueBigNumber} pairContract={pairAddress} currencyValue={toToken} onSelect={onToTokenChange} currencies={counterpartTokens} />
          <Balance tokenBalance={toTokenBalance}/>
        </div>

        {approveNeeded && !isSwapping ? 
          (
            <button 
              onClick={onApproveRequested}
              disabled={!canApprove}
              className={`${styles.actionButton} ${canApprove ? "bg-site-pink text-white" : "bg-site-dim2 text-site-dim2"}`}
            >
              {isApproving ? "Approving..." : "Approve"}
            </button>
          ) 
        :
          (
            <button 
              onClick={onSwapRequested}
              disabled={!canSwap}
              className={`${styles.actionButton} ${canSwap ? "bg-site-pink text-white" : "bg-site-dim2 text-site-dim2"}`}
            >
              {isSwapping ? "Swapping..." : "hasEnoughBalance" ? "Swap" : "Insufficient balance"}
            </button>
          )
        }

        {failureMessage && !resetState ? 
          (
            <p className={styles.message}>{failureMessage}"</p>
          )
          : 
          successMessage ? <p className={styles.message}>{successMessage}</p> : ""
        }
    </div>
  )
}

export default Exchange