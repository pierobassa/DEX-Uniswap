import { abis } from "@my-app/contracts";


export const getRouterInfo = async (routerAddress, web3) => {
    const router = new web3.eth.Contract(abis.router02, routerAddress);

    console.log("router: ", router)


    return { //returning an object that has 1 property called factory. We are returning the address of the factory we created. factory() is a method of the router contract that returns the address
        factory: await router.methods.factory().call()
    };
}