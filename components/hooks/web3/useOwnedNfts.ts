import { Nft } from "@_types/";
import { CryptoHookFactory } from "@_types/hooks";
import { ethers } from "ethers";
import { useCallback } from "react";
import useSWR from "swr"

type UseOwnedNftsResponse = { 
    listNft: (tokenId:number, newPrice:number) => Promise<void>
}

type OwnedNftsHookFactory = CryptoHookFactory<Nft[], UseOwnedNftsResponse>

export type UseOwnedNftsHook = ReturnType<OwnedNftsHookFactory>

export const hookFactory: OwnedNftsHookFactory = ({contract}) => () => {
    const {data, ...swr} = useSWR(
        contract ? "web3/useOwnedNfts" : null, 
        async () =>{
            const nfts = [] as Nft[];
            const coreNfts = await contract!.getOwnedNfts();
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

    const _contract = contract;

    const listNft = useCallback(async (tokenId:number, newPrice: number) =>{
        try{
            await contract!.placeNftOnSale( 
                tokenId,
                ethers.utils.parseEther(newPrice.toString()),{
                    value: ethers.utils.parseEther("0.025")
                }
            )
            alert("Item has been listed!")
        }catch (e:any){
            console.error(e.message);
        }
    },[_contract]);

    return {
        ...swr,
        listNft,
        data: data || []
    };
}

// export const useAccount = hookFactory({ethereum:undefined, provider:undefined})