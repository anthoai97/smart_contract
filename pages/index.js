import Head from "next/head";
import Image from "next/image";
import Header from "../components/Header";
import StakeDetails from "../components/StakeDetails";
import styles from "../styles/Home.module.css";

export default function Home() {
    return (
        <div>
            <Header />
            <StakeDetails />
        </div>
    );
}
