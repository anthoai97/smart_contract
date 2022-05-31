import Link from "next/link";
import { useMoralis } from "react-moralis";

export default function Home() {
    return (
        <div>
            <div className="mt-10 text-2xl text-center">Welcome to demo smart contract</div>
            <div className="p-5">
                <Link href="/staking">Staking App</Link>
            </div>

            <div className="p-5">
                <Link href="/staking">Raffle App</Link>
            </div>
        </div>
    );
}
