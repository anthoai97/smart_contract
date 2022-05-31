import React from "react";
import { useMoralis } from "react-moralis";
import LotteryEntrance from "../../components/LotteryEntrance";

export default function Raffle() {
    const { isWeb3Enabled } = useMoralis();
    return (
        <div>
            {isWeb3Enabled ? (
                <>
                    <LotteryEntrance />
                 </>
            ) : (
                <div>No metamask deteched... </div>
            )}{" "}
        </div>
    );
}
