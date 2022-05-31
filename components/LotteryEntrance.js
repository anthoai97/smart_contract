import { utils } from "ethers";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useState, useEffect } from "react";
import { Button } from "web3uikit";
import { raffleAbi, raffleAddress } from "../constants";

export default function LotteryEntrance() {
    const { chainId, isWeb3Enabled } = useMoralis();
    const [recentWiner, setRecentWiner] = useState("0x0");
    const [numberPlayer, setNumberPlayer] = useState(0);
    const { runContractFunction: buyLottery } = useWeb3Contract({
        abi: raffleAbi,
        contractAddress: raffleAddress[parseInt(chainId)][0],
        functionName: "enterRaffle",
        msgValue: utils.parseEther("0.1"),
        params: {},
    });


    // View contract function
    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: raffleAbi,
        contractAddress: raffleAddress[parseInt(chainId)][0],
        functionName: "getNumberOfPlayers",
        params: {},
    });

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: raffleAbi,
        contractAddress: raffleAddress[parseInt(chainId)][0],
        functionName: "getRecentWinner",
        params: {},
    });

    async function onbyLottery() {
        const tx = await buyLottery({
            onError: (error) => console.error(error),
        });
        await tx.wait();
        updateUI();
    }

    async function updateUI() {
        const recentWinnerFromCall = await getRecentWinner();
        setRecentWiner(recentWinnerFromCall);
        const numberPlayerFromCall  = await getNumberOfPlayers({
            onError: (err) => console.error(err)
        });
        setNumberPlayer(parseInt(numberPlayerFromCall));
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI();
        }
    }, [isWeb3Enabled]);

    return (
        <div className="p-10">
            <div className="mb-4">Number of player: {numberPlayer}</div>
            <div className="mb-4">Recent Winner: {recentWiner}</div>
            <Button text="Enter lottery" onClick={onbyLottery} />
        </div>
    );
}
