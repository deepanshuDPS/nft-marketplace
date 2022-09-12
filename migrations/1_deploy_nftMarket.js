const NftMarket = artifacts.require("./NftMarket.sol")

module.exports = function (deployer) {
    deployer.deploy(NftMarket)
}

