const stakingAdress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const rewardTokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const raffleAddress = require("./raffleAddress.json");

const stakingAbi = require("./stakingAbi.json");
const rewardTokenAbi = require("./rewardTokenAbi.json");
const raffleAbi = require("./raffleAbi.json");

module.exports = {
    stakingAbi,
    rewardTokenAbi,
    rewardTokenAddress,
    stakingAdress,
    raffleAbi,
    raffleAddress,
};
