const { network } = require("hardhat");
const fs = require("fs");

console.log(process.env.USERHOME);
const frontEndContractsFile =
    process.env.USERHOME + "/blockchain/contract/constants/raffleAddress.json";
const frontEndAbiFile =
    process.env.USERHOME + "/blockchain/contract/constants/raffleAbi.json";

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...");
        await updateContractAddresses("Raffle");
        await updateAbi("Raffle");
        console.log("Front end written!");
    }
};

async function updateAbi(name) {
    const contract = await ethers.getContract(name);
    fs.writeFileSync(frontEndAbiFile, contract.interface.format(ethers.utils.FormatTypes.json));
}

async function updateContractAddresses(name) {
    const contract = await ethers.getContract(name);
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"));
    if (network.config.chainId.toString() in contractAddresses) {
        if (!contractAddresses[network.config.chainId.toString()].includes(contract.address)) {
            contractAddresses[network.config.chainId.toString()].push(contract.address);
        }
    } else {
        contractAddresses[network.config.chainId.toString()] = [contract.address];
    }

    console.log(network.config.chainId.toString());
    try {
        fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));
    } catch (e) {
        console.log(e);
    }
}

module.exports.tags = ["all", "raffle"];
