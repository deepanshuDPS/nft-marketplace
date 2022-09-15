import { CryptoHookFactory } from "@_types/hooks";
import { useEffect } from "react";
import useSWR from "swr"

const Web3 = require('web3');

// uni swap token for current account
const getUniSwapToken = async (account:string) =>{
    try{
        const rpc = process.env.NEXT_PUBLIC_RPC_URL as string;
        const newProvider = new Web3.providers.HttpProvider(rpc);
        const token = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';
        const minABI = [
                {
                    constant: true,
                    inputs: [{ name: "_owner", type: "address" }],
                    name: "balanceOf",
                    outputs: [{ name: "balance", type: "uint256" }],
                    type: "function",
                },
                ];
        const web3 = new Web3(newProvider);
        const contract = new web3.eth.Contract(minABI, token);
        const res = await contract.methods.balanceOf(account).call();
        const format = web3.utils.fromWei(res);
        console.log('here_'+format);
        }catch(e){
            console.log(e);
        }
}

type UseAccountResponse = {
    connect: () => void;
    isLoading: boolean;
    isInstalled: boolean;
}

type AccountHookFactory = CryptoHookFactory<string, UseAccountResponse>

export type UseAccountHook = ReturnType<AccountHookFactory>

export const hookFactory: AccountHookFactory = ({provider, ethereum, isLoading}) => () => {
    const {data, mutate, isValidating, ...swr} = useSWR(provider? "web3/useAccount" : null, async () =>{
        
        const accounts = await provider!.listAccounts();
        const account = accounts[0];
        if(!account){
            throw "Cannot retreive account? Please, connect to web3 wallet."
        }
       // await getUniSwapToken(account);
        return account;
    },{
        revalidateOnFocus:false,
        shouldRetryOnError: false
    })

    useEffect(()=>{
        ethereum?.on("accountsChanged",handleAccountsChanged);
        return ()=>{
            ethereum?.removeListener("accountsChanged", handleAccountsChanged);
        }
    })

    const handleAccountsChanged = (...args: unknown[])=>{
        console.log(args);
        const accounts = args[0] as string[];
        if(accounts.length === 0 ){
            //mutate(undefined);
            console.error("Please, connect to web3 wallet");
        } else if(accounts[0] !== data){
            mutate(accounts[0]);
        }
    }

    const connect = async () =>{
        try{
            ethereum?.request({method:"eth_requestAccounts"});
        }catch(e){
            console.error(e);
        }
    }

    return {
        ...swr,
        data,
        isValidating,
        isLoading: isLoading as boolean,
        isInstalled: ethereum?.isMetaMask || false,
        mutate,
        connect
    };
}

// export const useAccount = hookFactory({ethereum:undefined, provider:undefined})