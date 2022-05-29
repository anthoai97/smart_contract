import Link from "next/link";
import { ConnectButton } from "web3uikit";

export default function Header() {
    return (
        <nav className="p-5 border-b-2 flex flex-row items-center">
            <h1 className="py-4 px-4 font-bold text-3xl">Contract Example App</h1>
            <div className="p-5">
                <Link href="/staking">Staking App</Link>
            </div>
            <div className="ml-auto py-2 px-4">
                <ConnectButton moralisAuth={false} />
            </div>
        </nav>
    );
}
