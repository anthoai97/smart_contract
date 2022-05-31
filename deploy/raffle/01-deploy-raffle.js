const { ethers, network } = require("hardhat");
const { developmentChains, networkConfig, VERIFICATION_BLOCK_CONFIRMATIONS } = require("../../helper-hardhat-config");

const FUND_AMOUNT = "1000000000000000000000";
const { verify } = require("../../utils/verify");

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = await getChainId();
    let vrfCoordinatorV2Address, subscriptionId;

    if (chainId == 31337) {
        // create VRFV2 Subscription
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
        log(`vrfCoordinatorV2Address ${vrfCoordinatorV2Address}`);
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
        const transactionReceipt = await transactionResponse.wait();
        subscriptionId = transactionReceipt.events[0].args.subId;
        log(`subscriptionId ${subscriptionId}`);

        // Fund the subscription
        // Our mock makes it so we don't actually have to worry about sending fund
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2Address"];
        subscriptionId = networkConfig[chainId]["subscriptionId"];
    }

    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS;

    log("----------------------------------------------------");
    const args = [
        networkConfig[chainId]["raffleEntranceFee"],
        networkConfig[chainId]["keepersUpdateInterval"],
        vrfCoordinatorV2Address,
        networkConfig[chainId]["gasLane"],
        subscriptionId,
        networkConfig[chainId]["callbackGasLimit"],
    ];

    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitBlockConfirmations: waitBlockConfirmations,
    });

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...");
        await verify(raffle.address, args);
    }
};

module.exports.tags = ["all", "raffle"];
