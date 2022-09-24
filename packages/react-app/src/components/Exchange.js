import React from 'react'
import { useState } from 'react'
import { Contract } from '@ethersproject/contracts'
import { abis } from '@my-app/contracts'
import { ERC20, useContractFunction, useEthers, useTokenAllowance, useTokenBalance } from '@usedapp/core'
import { ethers } from 'ethers' 
import { parseUnits } from 'ethers/lib/utils'

import { ROUTER_ADDRESS } from '../config'

const Exchange = ({pools}) => {
  return (
    <div>
        EXCHANGE
    </div>
  )
}

export default Exchange