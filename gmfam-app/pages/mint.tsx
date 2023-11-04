import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { ContractFunctionExecutionError, parseEther } from "viem";
import { useEffect, useState } from "react";
import { readContract, prepareWriteContract, writeContract } from "@wagmi/core";
import { useAccount, useContractRead } from "wagmi";
import { Input, Button } from "@chakra-ui/react";
import toast, { Toaster } from "react-hot-toast";

import HamburgerMenu from "../components/hamburgerMenu";
import UniqueFooter from "../components/uniqueFooter";

import GmFam from "../abis/GmFam.json";
import ERC721 from "../abis/ERC721.json";

import handleErrorGmFamContracts from "../components/errors/handleErrorGmFamContract";
import handleErrorTransactionExecutionError from "../components/errors/handleErrorTransactionExecutionError";

const Home: NextPage = () => {
  const { address, isConnected } = useAccount();
  const [isClient, setIsClient] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const givePermission = () => {
    const inputIds = ["gmFam_new_addresss", "mint_id"];

    // pasar por todos
    const inputs = inputIds.map((id) => {
      const input = document.getElementById(id) as HTMLInputElement;
      return input.value;
    });

    //marcar cuando falta algun input
    if (inputs.some((input) => input === "")) {
      toast.error("Please fill all the inputs", {
        duration: 2000,
        position: "top-right",
      });
      return;
    }

    var srcAddress = inputs[0];
    var tokenId = inputs[1];
    console.log(srcAddress);

    readContract({
      address: srcAddress as "0x${string}",
      abi: GmFam.abi,
      args: [],
      functionName: "getOriginalCollectionAddress",
    })
      .then((data) => {
        prepareWriteContract({
          address: data as "0x${string}",
          abi: ERC721.abi,
          functionName: "approve",
          args: [srcAddress, tokenId],
          account: address,
        })
          .then((data) => {
            writeContract(data)
              .then((result) => {
                setPermissionGranted(true);
                toast(`Hash: ${result.hash}`, {
                  duration: 3000,
                  position: "top-right",
                  style: {
                    wordWrap: "break-word",
                    wordBreak: "break-all",
                  },
                });
                toast.success("Permission granted", {
                  duration: 2000,
                  position: "top-right",
                });
              })
              .catch((error) => {
                console.log(error);
              });
          })
          .catch(handleErrorTransactionExecutionError);
      })
      .catch((error) => {
        toast.error(
          "There was an error trying to get the approval, please check the address and try again",
          {
            duration: 2000,
            position: "top-right",
          }
        );
      });
  };

  const safeMint = () => {
    const inputIds = ["gmFam_new_addresss", "mint_id"];
    const inputs = inputIds.map((id) => {
      const input = document.getElementById(id) as HTMLInputElement;
      return input.value;
    });
    if (inputs.some((input) => input === "")) {
      toast.error("Please fill all the inputs", {
        duration: 2000,
        position: "top-right",
      });
      return;
    }

    var mintAddress = inputs[0];
    var tokenId = inputs[1];

    console.log(mintAddress);
    var costPerMint = 0;
    readContract({
      address: mintAddress as "0x${string}",
      abi: GmFam.abi,
      args: [],
      functionName: "readCost",
    })
      .then((data) => {
        console.log(data);
        costPerMint = data as number;
      })
      .then(() => {
        prepareWriteContract({
          address: mintAddress as "0x${string}",
          abi: GmFam.abi,
          functionName: "safeMint",
          args: [tokenId],
          account: address,
          value: BigInt(costPerMint),
        })
          .then((data) => {
            writeContract(data).then((data) => {
              toast(`Hash: ${data.hash}`, {
                duration: 3000,
                position: "top-right",
                style: {
                  wordWrap: "break-word",
                  wordBreak: "break-all",
                },
              });
              toast.success("Token minted", {
                duration: 2000,
                position: "top-right",
              });
            });
          })
          .catch(handleErrorTransactionExecutionError);
      })
      .catch(handleErrorGmFamContracts);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Wrap &amp; Mint in gm Fam!</title>
        <meta
          content="With this tool you can wrap and mint your NFTs in gm Fam!"
          name="Wrap &amp; Mint NFT in gm Fam!"
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

        <HamburgerMenu numberBlocker={2} />
      </header>
      <main className={styles.main}>
        {isClient && (
          <div
            style={{
              padding: "20px",
            }}
          >
            <div className={styles.container__SingleForm}>
              <img src="/uvas-mint.svg" alt="gmFam Logo" />
              <h1
                style={{
                  color: "#083f99",
                  fontSize: "40px",
                  fontWeight: "bold",
                }}
              >
                Wrap &amp; Mint
              </h1>
            </div>
            <div className={styles.containerForm__a}>
              <h1>gm Fam! Deployed Smart Contract address (New one)</h1>
              <Input
                size="sm"
                type="text"
                backgroundColor="gray.100"
                placeholder="0x..."
                id="gmFam_new_addresss"
              />
            </div>
            <div className={styles.containerForm__a}>
              <h1>Token ID (NFT)</h1>
              <Input
                size="sm"
                type="number"
                placeholder="0"
                backgroundColor="gray.100"
                id="mint_id"
                width={"200px"}
              />
            </div>
            <div className={styles.container__twoSideByside}>
              <div>
                <Button colorScheme="blue" onClick={givePermission}>
                  Give me your permission fren
                </Button>
              </div>
              <div>
                <Button
                  backgroundColor={"#F68CB0"}
                  colorScheme="pink"
                  onClick={safeMint}
                >
                  Mint
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <UniqueFooter />
    </div>
  );
};

export default Home;
