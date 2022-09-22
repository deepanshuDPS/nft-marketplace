


import { v4 as uuidv4 } from "uuid";
import { Session } from "next-iron-session";
import FormData from "form-data";
import { NextApiRequest, NextApiResponse } from "next";
import { addressCheckMiddleware, contractAddress, pinataApiKey, pinataSecretApiKey, withSession } from "./utils";
import { NftMetaData, PinataRes } from "types/nft";
import axios from "axios";

export default withSession(async ( req:NextApiRequest & {session:Session}, res: NextApiResponse) => {
    if(req.method === "POST"){
        try {
            const { body } = req;
            const nft = body.nft as NftMetaData

            if (!nft.imageFile || !nft.name || !nft.description || !nft.attributes) {
                return res.status(422).send({message: "Some of the form data are missing!"}); 
            }

            await addressCheckMiddleware(req, res);

            debugger;
            const bufferFromBytes = Buffer.from(Object.values(body.bytes) as Uint8Array | ReadonlyArray<number>);
            const formData = new FormData();
            const contentType = body.contentType;
            formData.append(
                "file",
                bufferFromBytes, {
                    contentType,
                    filename: body.fileName + "-" + uuidv4()
                }
            );

            const fileRes = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", 
            formData, 
            {
                maxBodyLength: Infinity,
                headers: {
                    "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
                    pinata_api_key: pinataApiKey,
                    pinata_secret_api_key: pinataSecretApiKey
                }
                });

            let fileData = (await fileRes.data) as PinataRes;

            // if(fileData.isDuplicate){
            //     return res.status(422).send({message: "Cannot create JSON"})
            // }
            let newNftData = nft
            delete newNftData['imageFile'];
            newNftData['image'] = `${process.env.NEXT_PUBLIC_PINATA_DOMAIN}/ipfs/${fileData.IpfsHash}`
            const jsonRes = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
                pinataMetadata: {
                  name: uuidv4()
                },
                pinataContent: newNftData
              }, {
                headers: {
                  pinata_api_key: pinataApiKey,
                  pinata_secret_api_key: pinataSecretApiKey
                }
              });
        
              return res.status(200).send(jsonRes.data);
        } catch(e:any) {
            console.error(e.meta);
            return res.status(422).send({message: "Cannot create JSON"})
        }
    }
    else if(req.method === "GET"){
        try{
            const message = {contractAddress, id: uuidv4()};
            req.session.set("message-session", message);
            await req.session.save();

            // console.log(req.session.get("message-session"));
            return res.json(message);
        }catch{
            return res.status(422).send({message: "Cannot generate a message!"})
        }
    } else {
        return res.status(200).json({message: "Invalid api route"});
    }
})