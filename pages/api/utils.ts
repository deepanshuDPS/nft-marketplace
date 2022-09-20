
import { ethers } from "ethers";
import { Session } from "next-iron-session";
import { NextApiRequest, NextApiResponse } from "next";
import { withIronSession } from "next-iron-session";
import contract from "../../public/contracts/NftMarket.json";
import { NftMarketContract } from "@_types/";
import * as util from "ethereumjs-util";

const NETWORKS = {
    "5777" : "Ganache"
}

type NETWORK = typeof NETWORKS;

const abi = contract.abi;
const targetNetwork = process.env.NEXT_PUBLIC_NETWORK_ID as keyof NETWORK;

export const contractAddress = contract["networks"][targetNetwork]["address"];

export function withSession(handler: any) {
    return withIronSession(handler, {
        password: process.env.SECRET_COOKIE_PASSOWRD as string,
        cookieName: "nft-auth-session",
        cookieOptions:{
            secure: process.env.NODE_ENV === "production"
        }
    })
}

export const addressCheckMiddleware = async (req:NextApiRequest & {session:Session}, res: NextApiResponse) => {
    return new Promise((resolve,reject) =>{
        const message = req.session.get("message-session");
        const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545");
        const contract = new ethers.Contract(
            contractAddress,
            abi,
            provider) as unknown as NftMarketContract;

        // session nonce - unsigned message
        // and request has signature message
        let nonce: string | Buffer = 
        "\x19Ethereum Signed Message:\n" + 
        JSON.stringify(message).length + 
        JSON.stringify(message);
        
        // make unsigned to signed message using nonce
        nonce = util.keccak(Buffer.from(nonce,"utf-8"));

        const { v, r, s } = util.fromRpcSig(req.body.signature);
        const pubKey = util.ecrecover(util.toBuffer(nonce), v, r, s);
        const addrBuffer = util.pubToAddress(pubKey);
        const address = util.bufferToHex(addrBuffer);
        
        if(address === req.body.address){
            console.log("created")
            resolve("Correct");
        }else{
            reject("wrong");
        }   
    })
}

