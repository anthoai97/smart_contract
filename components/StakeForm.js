import { useWeb3Contract } from "react-moralis";
import { rewardTokenAbi, rewardTokenAddress, stakingAbi, stakingAdress } from "../constants";
import { Form } from "web3uikit";
import { ethers } from "ethers";

export default function StakeForm() {
    const { runContractFunction } = useWeb3Contract();
    let approveOptions = {
        abi: rewardTokenAbi.abi,
        contractAddress: rewardTokenAddress,
        functionName: "approve",
    };

    let stakeOptions = {
        abi: stakingAbi.abi,
        contractAddress: stakingAdress,
        functionName: "stake",
    };

    async function handleSubmit(data) {
        const amountToApprove = data.data[0].inputResult;
        approveOptions.params = {
            amount: ethers.utils.parseUnits(amountToApprove, "ether").toString(),
            spender: stakingAdress,
        };
        console.log("Approving...");
        const tx = await runContractFunction({
            params: approveOptions,
            onError: (error) => console.log(error),
            onSuccess: () => {
                handleApproveSuccess(approveOptions.params.amount);
            },
        });
    }

    async function handleApproveSuccess(amountToStakeFormatted) {
        stakeOptions.params = { 
            '_amount': amountToStakeFormatted,
        }
        console.log(`Staking ${stakeOptions.params._amount}`);
        const tx = await runContractFunction({
            params: stakeOptions,
            onError: (error) => console.log(error),
        })

        await tx.wait(1)
        console.log("Transaction has been confirmd by 1 block");
    }

    return (
        <div>
            <Form
                onSubmit={handleSubmit}
                data={[
                    {
                        inputWidth: "50%",
                        name: "Amount to stake in (ETH)",
                        type: "number",
                        value: "",
                        key: "amountToStake",
                    },
                ]}
                title="Let's stake"
            ></Form>
        </div>
    );
}
