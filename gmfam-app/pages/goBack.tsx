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
} from "@chakra-ui/react";

import GmFam from "../abis/GmFam.json";

import HamburgerMenu from "../components/hamburgerMenu";
import UniqueFooter from "../components/uniqueFooter";

import toast, { Toaster } from "react-hot-toast";

import handleErrorTransactionExecutionError from "../components/errors/handleErrorTransactionExecutionError";
import handleErrorGmFamContracts from "../components/errors/handleErrorGmFamContract";

const Home: NextPage = () => {
  const { address, isConnected } = useAccount();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const byeBye = () => {
    const inputIds = ["SourceAddress", "bye_id"];

    // pasar por todos
    const inputs = inputIds.map((id) => {
      const input = document.getElementById(id) as HTMLInputElement;
      return input.value;
    });

    //marcar cuando falta algun input
    if (inputs.some((input) => input === "")) {
      alert("Please fren fill all the inputs");
      return;
    }

    var srcAddress = inputs[0];
    var tokenId = inputs[1];

    prepareWriteContract({
      address: srcAddress as "0x${string}",
      abi: GmFam.abi,
      functionName: "goBackToOriginalCollection",
      args: [parseInt(tokenId)],
      account: address,
    }).then((result) => {
        console.log(result);
        writeContract(result).then((result) => {
          toast(`Hash: ${result.hash}`, {
            duration: 3000,
            position: "top-right",
            style: {
              wordWrap: "break-word",
              wordBreak: "break-all",
            },
          });
          toast.success(`Token burned`, {
            duration: 3000,
            position: "top-right",
          });
        }).catch(handleErrorTransactionExecutionError);
      }).catch(handleErrorGmFamContracts);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Go back to the Original Collection</title>
        <meta
          content="You can go back to the original collection"
          name="Go back to the Original Collection"
        />
        <link href="/favicon.png" rel="icon" />
      </Head>
      <header>
        <img
          src="/pink-logo.png"
          alt="RainbowKit Logo"
          height={100}
          width={100}
        />

        
        <HamburgerMenu numberBlocker={3} />
      </header>
      <main className={styles.main}>
        {isClient && (
          <div
            style={{
              padding: "20px",
            }}
          >
            <div className={styles.container__SingleForm}>
              <img src="/fresa-text-back.svg" alt="gmFam Logo" />
              <h1
                style={{
                  color: "#083f99",
                  fontSize: "25px",
                  fontWeight: "bold",
                }}
              >
                Go back to the original collection
              </h1>
            </div>
            <div className={styles.containerForm__a}>
              <h1>gm Fam! Deployed Smart Contract address (New one)</h1>
              <Input
                size="sm"
                type="text"
                backgroundColor="gray.100"
                placeholder="0x..."
                id="SourceAddress"
              />
            </div>
            <div className={styles.containerForm__a}>
              <h1>Token ID (NFT)</h1>
              <div className={styles.inputWithButton}>
                <Input
                  size="sm"
                  type="number"
                  placeholder="0"
                  backgroundColor="gray.100"
                  id="bye_id"
                />
                <Button colorScheme="pink" onClick={byeBye}>
                  <h2
                    style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "wihte",
                    }}
                  >
                    Send me back
                  </h2>
                </Button>
              </div>
            </div>
            <div
              style={{
                paddingTop: "1rem",
              }}
            ></div>
          </div>
        )}
      </main>

      <UniqueFooter />
    </div>
  );
};

export default Home;
