
export type Trait = "attack" | "health" | "speed";

export type NFtAttribute = {
    trait_type: Trait;
    value:string;
}


export type NftMetaData = {
    name: string,
    description: string,
    image: string,
    attributes: NFtAttribute[];
}


export type NftCore = {
    tokenId: number;
    price: number;
    creator: string;
    isListed: boolean
}

export type Nft = {
    meta: NftMetaData
} & NftCore