
import { setupHooks, Web3Hooks } from "@hooks/web3/setupHooks";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { Web3Dependencies, Nullable } from "types/hooks";
import { Contract, ethers, providers } from "ethers";

declare global{
    interface Window{
        ethereum: MetaMaskInpageProvider
    }
}

// export type Web3Params = {
//     ethereum: MetaMaskInpageProvider | null;
//     provider: providers.Web3Provider | null,
//     contract: Contract | null
// }

export type Web3State = {
    isLoading: boolean; // true while loading web3State
    hooks: Web3Hooks
} & Nullable<Web3Dependencies>

export const createDefaultState = () => {
    return {
        ethereum:null,
        provider:null,
        contract:null,
        isLoading:true,
        hooks: setupHooks({isLoading:true} as any)
    }
}


export const createWeb3State = ({
    ethereum, provider, contract, isLoading
}: Web3Dependencies) => {
    return {
        ethereum,
        provider,
        contract,
        isLoading,
        hooks: setupHooks({ethereum, provider, contract, isLoading})
    }
}

const NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID;

export const loadContract = async (
    name:string, 
    provider:providers.Web3Provider
    ) :Promise<Contract> => {
        
        if(!NETWORK_ID){
            return Promise.reject("Network ID is not defined")
        }
        
        const res = await fetch(`/contracts/${name}.json`);
        const truffleJson = await res.json();
        
        
        if(truffleJson.networks[NETWORK_ID].address){
            const contract = new ethers.Contract(
                truffleJson.networks[NETWORK_ID].address,
                truffleJson.abi,
                provider
            )
            return contract
        } else{
            return Promise.reject("Contract can't be loaded")
        }
}