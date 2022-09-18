import { Nft } from "@_types/";
import { CryptoHookFactory } from "@_types/hooks";
import { ethers } from "ethers";
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

type UseListedNftsResponse = { }

type ListedNftsHookFactory = CryptoHookFactory<Nft[], UseListedNftsResponse>

export type UseListedNftsHook = ReturnType<ListedNftsHookFactory>

export const hookFactory: ListedNftsHookFactory = ({contract}) => () => {
    const {data, ...swr} = useSWR(
        contract ? "web3/useListedNfts" : null, 
        async () =>{
            const nfts = [] as Nft[];
            const coreNfts = await contract!.getAllNftsOnSale();
            for(let i=0; i<coreNfts.length; i++){
                const item = coreNfts[i];
                const tokenURI = await contract!.tokenURI(item.tokenId);
                const metaRes = await fetch(tokenURI);
                const meta = await metaRes.json();
                nfts.push({
                    price: parseFloat(ethers.utils.formatEther(item.price)),
                    tokenId:item.tokenId.toNumber(),
                    creator: item.creator,
                    isListed: item.isListed,
                    meta
                })
            }
            return nfts;
    })


    return {
        ...swr,
        data: data || []
    };
}

// export const useAccount = hookFactory({ethereum:undefined, provider:undefined})