import { abis } from "@my-app/contracts"
import Web3 from "web3"


export const getRouterInfo = async (routerAddress, web3) => {
    const router = new web3.eth.Contract(abis.router02, routerAddress);

    return { //returning an object that has 1 property called factory. We are returning the address of the factory we created. factory() is a method of the router contract that returns the address
        factory: await router.methods.factory().call(),
    }
}