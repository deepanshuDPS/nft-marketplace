
const instance = await NftMarket.deployed();

instance.mintToken("https://gateway.pinata.cloud/ipfs/QmbCxu4mkWWHqxhipz6iyrpBiZUjFp596AuzTabcoFTb24","200000000000000000",{  value:"25000000000000000", from: accounts[0] })
instance.mintToken("https://gateway.pinata.cloud/ipfs/QmWsbdzqsjxNfB9SVXRC6qEadkmkjYTechnfqEE9kigrmj","200000000000000000",{  value:"25000000000000000", from: accounts[0] })


