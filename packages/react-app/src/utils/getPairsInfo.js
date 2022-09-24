import { abis } from "@my-app/contracts";


export const getPairsInfo = async (pairAddresses, web3) => {
    const pairsInfo = [];

    const pairABI = abis.pair;
    const erc20ABI = abis.erc20.abi;

    for(let i = 0; i < pairAddresses.length; i++){
        const pairAddress = pairAddresses[i];
        const pair = new web3.eth.Contract(pairABI, pairAddress);

        const token0Address = await pair.methods.token0().call();
        const token1Address = await pair.methods.token1().call();

        const token0Contract = new web3.eth.Contract(erc20ABI, token0Address);
        const token1Contract = new web3.eth.Contract(erc20ABI, token1Address);

        const token0Name = await token0Contract.methods.name().call();
        const token1Name = await token1Contract.methods.name().call();

        pairsInfo.push({
            address: pairAddress,
            token0Address: token0Address,
            token1Address: token1Address,
            token0Name: token0Name,
            token1Name: token1Name
        });
    }

    return pairsInfo;
}