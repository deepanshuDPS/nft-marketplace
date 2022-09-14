const NftMarket = artifacts.require("NftMarket");

const { ethers } = require('ethers');

contract("NftMarket", accounts =>{
    let _contract = null;
    let _nftPrice = ethers.utils.parseEther("0.3").toString();
    let _listingPrice = ethers.utils.parseEther("0.025").toString();
    before(async () => {
        _contract = await NftMarket.deployed();
        
    })

    describe("Mint Token", () =>{
        const tokenURI = "https://test.com"
        before(async ()=>{
            await _contract.mintToken(tokenURI, _nftPrice, {
                from:accounts[0],
                value: _listingPrice
            })
        })

        it("owner of the first token should be address[0]", async () =>{
            let owner = await _contract.ownerOf(1);
            assert.equal(owner, accounts[0], "Owner of token is not matching the address[0]")
        })

        it("first token should be point to the correct tokenURI", async () =>{
            const actualTokenUri = await _contract.tokenURI(1);
            assert.equal(actualTokenUri, tokenURI, "tokenURI is not correctly set");
        })

        it("should not be possible to create a NFT with used tokenURI", async () =>{

            try{
                await _contract.mintToken(tokenURI, _nftPrice, {
                    from:accounts[0],
                    value: _listingPrice
                })
                assert(false);
            } catch(e){
                assert(e, "Token URI is already exist")
            }

        })

        it("should have one listed item", async () =>{
            const listedItemCount = await _contract.listedItemsCount();
            assert.equal(listedItemCount.toNumber(), 1, "Listed items count is not 1");
        })

        it("should have create NFT item", async () =>{
            const nftItem = await _contract.getNftItem(1);
            assert.equal(nftItem.tokenId, 1, "Token id is not 1");
            assert.equal(nftItem.price, _nftPrice, "Price is not same");
            assert.equal(nftItem.creator, accounts[0], "Accounts are not same");
            assert.equal(nftItem.isListed, true, "Not listed");

        })
    })

    describe("Buy NFT",() =>{
        before(async() =>{
            await _contract.buyNft(1,{
                from:accounts[1],
                value:_nftPrice
            })
        })

        it("should unlist the item", async ()=>{
            const listItem = await _contract.getNftItem(1);
            assert.equal(listItem.isListed, false, "Item is still listed");
        })

        it("should decrease listed items count", async ()=>{
            const listedItemCount = await _contract.listedItemsCount();
            assert.equal(listedItemCount.toNumber(), 0, "Count has not been decrement");
        })

        it("should change the owner", async ()=>{
            const currentOwner = await _contract.ownerOf(1);
            assert.equal(currentOwner, accounts[1], "Owner not changed");
        })
    })
})