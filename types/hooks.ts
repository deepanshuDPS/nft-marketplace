import { Web3Hooks } from "@hooks/web3/setupHooks";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { providers } from "ethers"
import { SWRResponse } from "swr";
import { NftMarketContract } from "./nftMarketContract";


export type Web3Dependencies = {
    provider: providers.Web3Provider;
    contract: NftMarketContract;
    ethereum: MetaMaskInpageProvider;
    isLoading: boolean;
    hooks?: Web3Hooks
}

export type CryptoHookFactory<D = any, R = any, P = any> = {
    (d:Partial<Web3Dependencies>): CryptoHandlerHook<D, R, P>
}

export type CryptoHandlerHook<D = any, R = any, P = any> = (params?:P) => CrytoSWRResponse<D,R>

export type CrytoSWRResponse<D = any, R = any> = SWRResponse<D> & R;

// export type CryptoHookFactory<D = any, P = any> = {
//     (d:Partial<Web3Dependencies>): (params:P) => SWRResponse<D>
// }

export type Nullable<T> = {
    [P in keyof T]:T[P] | null;
}