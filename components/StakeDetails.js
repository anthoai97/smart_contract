import { useMoralis, useWeb3Contract } from "react-moralis";
import { useEffect, useState } from "react";
import { rewardTokenAbi, rewardTokenAddress, stakingAbi, stakingAdress } from "../constants";
import { ethers } from "ethers";
import StakeForm from "./StakeForm";
import { Button } from "web3uikit";

export default function StakeDetails() {
    const { account, isWeb3Enabled } = useMoralis();
    const [rtBalance, setRtBalance] = useState("0");
    const [stakedBalance, setStakedBalance] = useState("0");
    const [earnedBalance, setEarnedBalance] = useState("0");

    const { runContractFunction: getRtBalance } = useWeb3Contract({
        abi: rewardTokenAbi.abi,
        contractAddress: rewardTokenAddress,
        functionName: "balanceOf",
        params: {
            account: account,
        },
    });

    const { runContractFunction: mintToken } = useWeb3Contract({
        abi: rewardTokenAbi.abi,
        contractAddress: rewardTokenAddress,
        functionName: "mint",
        params: {
            _account: account,
            _amount: ethers.utils.parseUnits("10000", "ether").toString(),
        },
    });

    const { runContractFunction: getStakedBalance } = useWeb3Contract({
        abi: stakingAbi.abi,
        contractAddress: stakingAdress,
        functionName: "getStaked",
        params: { _account: account },
    });

    const { runContractFunction: getEarnedBalance } = useWeb3Contract({
        abi: stakingAbi.abi,
        contractAddress: stakingAdress,
        functionName: "earned",
        params: { _account: account },
    });

    useEffect(() => {
        // Update UI and get balances
        if (isWeb3Enabled && account) {
            updateUiValues();
        }
    }, [account, isWeb3Enabled]);

    async function fauceToken() {
        const tx = await mintToken();

        await tx.wait(1);
        updateUiValues();
        console.log(`Mint successful....`);
    }

    async function updateUiValues() {
        const rtBalanceFromContract = await getRtBalance({
            onError: (error) => console.log(error),
        });

        const formattedRtBalanceFromContract = ethers.utils.formatUnits(
            rtBalanceFromContract,
            "ether"
        );

        setRtBalance(formattedRtBalanceFromContract);

        const stakedFromContract = await getStakedBalance({
            onError: (error) => console.log(error),
        });

        const formattedStakedFromContract = ethers.utils.formatUnits(stakedFromContract, "ether");

        setStakedBalance(formattedStakedFromContract);

        const earnedFromContract = await getEarnedBalance({
            onError: (error) => console.log(error),
        });

        const formattedEarnedFromContract = ethers.utils.formatUnits(earnedFromContract, "ether");
        setEarnedBalance(formattedEarnedFromContract);
    }

    return (
        <div>
            <div className="flex align-center items-center">
                <div className="mr-5">RT balance is: {rtBalance}</div>
                <Button text="Fauce RT Token" onClick={fauceToken} />
            </div>
            <div>Earned balance is: {earnedBalance}</div>
            <div>Staked balance is: {stakedBalance}</div>
            <StakeForm />
        </div>
    );
}
