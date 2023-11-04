import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { ContractFunctionExecutionError, parseEther } from "viem";
import { useEffect, useState } from "react";
import { readContract, prepareWriteContract, writeContract } from "@wagmi/core";
import { useAccount, useContractRead } from "wagmi";
import {
  Input,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";
import { FaRegClipboard, FaBars } from "react-icons/fa6";

import GmFam from "../abis/GmFam.json";

import HamburgerMenu from "../components/hamburgerMenu";
import UniqueFooter from "../components/uniqueFooter";

const Home: NextPage = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className={styles.principalContainer}>
      <Head>
        <title>gm Fam!</title>
        <meta content="Wellcome to the gm Fam!" name="gm Fam!" />
        <link href="/favicon.png" rel="icon" />
      </Head>
      <header>
        <img src="/logo.png" alt="RainbowKit Logo" height={100} width={100} />

        <HamburgerMenu numberBlocker={0} />
      </header>
      <main className={styles.main}>
        {isClient && (
          <>
            <div>
              <img src="/cover.png" alt="gm Fam" />
            </div>
            <div>
              <h1>What is gm Fam?</h1>
              <p>
                In the web3 world, many degens and users were excited about NFT
                Collections that represented community vibes, goals, and plans
                for the future. But as time went on, whether in a few weeks or
                after several years, about 90% of these NFT communities lost
                their activity and traction. This left many NFT holders feeling
                stuck and frustrated because these collections were either
                controlled by the founders or depended too much on the entire
                community of holders.
              </p>
              <p>
                To tackle this, &quot;gm Fam!&quot; emerged, allowing dedicated
                community members to create a new NFT Collection from the
                original ones (called &quot;wrapping&quot;). This new collection
                keeps ties with the original but sets new rules, goals, and
                directions.
              </p>
            </div>
            <div>
              <h1>The team behind gm Fam!</h1>
              <div>
                <div>
                  <h2>@andrealbiac</h2>
                  <p>
                    Graphic & Motion designer contributing to @BuidlGuidl 🏰✨
                  </p>
                </div>
                <div></div>
              </div>
              <div>
                <div>
                  <h2>@jistro</h2>
                  <p>Blockchain dev</p>
                </div>
                <div></div>
              </div>
              <div>
                <div>
                  <h2>@ariutokintumi</h2>
                  <p>
                    Blockchain dev, NFT enthusiast and director of the project
                  </p>
                </div>
                <div></div>
              </div>
            </div>
          </>
        )}
      </main>

      <UniqueFooter />
    </div>
  );
};

export default Home;
