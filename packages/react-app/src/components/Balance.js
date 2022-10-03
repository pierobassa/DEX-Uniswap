import React from 'react'

import { formatUnits, parseUnits } from 'ethers/lib/utils'

import styles from '../styles'

const Balance = ({tokenBalance}) => {

    return (
        <div className={styles.balance}>
            <p className={styles.balanceText}>
                {tokenBalance && (
                    <>
                        <span className={styles.balanceBold}>Balance: </span>
                        {formatUnits(tokenBalance || parseUnits("0"))} {/* If token balance doesn't exists, we pass 0 to parse for error handling*/}
                    </>
                )}
            </p>
        </div>
    )
}

export default Balance