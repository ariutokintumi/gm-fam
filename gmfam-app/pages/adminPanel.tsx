import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { ContractFunctionExecutionError, parseEther } from "viem";
import { useEffect, useState } from "react";
import { readContract, prepareWriteContract, writeContract } from "@wagmi/core";
import { useAccount, useContractRead } from "wagmi";
import toast, { Toaster } from "react-hot-toast";
import {
  Input,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Progress,
  InputGroup,
  InputRightAddon,
  Select,
  Divider,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Box,
  AccordionIcon,
  Accordion,
} from "@chakra-ui/react";
import { FaRegClipboard, FaBars } from "react-icons/fa6";

import GmFam from "../abis/GmFam.json";

import HamburgerMenu from "../components/hamburgerMenu";
import UniqueFooter from "../components/uniqueFooter";
import handleErrorGmFamContracts from "../components/errors/handleErrorGmFamContract";
import handleErrorTransactionExecutionError from "../components/errors/handleErrorTransactionExecutionError";

const Home: NextPage = () => {
  const { address, isConnected } = useAccount();
  const [contractBasicData, setContractBasicData] = useState([
    "",
    "",
    "",
    false,
  ]);
  const [isClient, setIsClient] = useState(false);
  const [makeAlertFees, setMakeAlertFees] = useState([false, false]);
  const [statusMenu, setStatusMenu] = useState(["none", "gray.200"]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const findMenu = () => {
    const inputsId = "selectOption";
    const option = (document.getElementById(inputsId) as HTMLInputElement)
      .value;
    console.log(option);
    if (option != "renounceOwnership" && option !== "transferBalance") {
      setStatusMenu([option, "blue.200"]);
    } else {
      setStatusMenu([option, "red.200"]);
    }
    if (option === "none") {
      setStatusMenu([option, "gray.200"]);
    }
  };

  const findContract = async () => {
    const inputsId = "findContract__contractAddress";
    const contractAddress = (
      document.getElementById(inputsId) as HTMLInputElement
    ).value;
    console.log(contractAddress);
    if (contractAddress === "") {
      toast.error("Please enter a contract address", {
        duration: 2000,
        position: "top-right",
      });
      return;
    }
    var symbol = "";
    var name = "";
    readContract({
      address: contractAddress as "0x${string}",
      abi: GmFam.abi,
      functionName: "name",
      args: [],
      account: address,
    })
      .then((result) => {
        console.log(result);
        name = result as string;
        readContract({
          address: contractAddress as "0x${string}",
          abi: GmFam.abi,
          functionName: "symbol",
          args: [],
          account: address,
        })
          .then((result) => {
            console.log(result);
            symbol = result as string;
            readContract({
              address: contractAddress as "0x${string}",
              abi: GmFam.abi,
              functionName: "isOwner",
              args: [],
              account: address,
            })
              .then((result) => {
                console.log(result);
                if (result === false) {
                  return;
                }
                setContractBasicData([name, symbol, contractAddress, true]);
                toast.success("Contract data found", {
                  duration: 2000,
                  position: "top-right",
                });
              })
              .catch((error) => {
                console.log(error);
                toast.error(
                  "Please make sure you have the right contract address",
                  {
                    duration: 2000,
                    position: "top-right",
                  }
                );
              });
          })
          .catch((error) => {
            console.log(error);
            toast.error(
              "There was an error finding your contract, please try again",
              {
                duration: 2000,
                position: "top-right",
              }
            );
          });
      })
      .catch((error) => {
        console.log(error);
        toast.error(
          "There was an error finding your contract, please try again",
          {
            duration: 2000,
            position: "top-right",
          }
        );
      });
  };

  const changeOwner = async () => {
    const inputsId = "changeOwner__address";
    const address = (document.getElementById(inputsId) as HTMLInputElement)
      .value;
    console.log(address);
    // make sure the client wants to do this
    if (
      !confirm(
        `Are you sure you want to transfer ownership of this contract to ${address}?`
      )
    ) {
      return;
    }
    if (!confirm(`Are you really sure?, this action is irreversible`)) {
      return;
    }
    prepareWriteContract({
      address: contractBasicData[2] as "0x${string}",
      abi: GmFam.abi,
      functionName: "changeOwner",
      args: [address],
      account: address as "0x${string}",
    })
      .then((result) => {
        writeContract(result)
          .then((result) => {
            console.log(result);
            toast(`Hash: ${result.hash}`, {
              duration: 3000,
              position: "top-right",
              style: {
                wordWrap: "break-word",
                wordBreak: "break-all",
              },
            });
            toast.success("Ownership transfered", {
              duration: 2000,
              position: "top-right",
            });
          })
          .catch(handleErrorTransactionExecutionError);
      })
      .catch(handleErrorGmFamContracts);
  };

  const changeCreatorFees = async () => {
    const inputsId = [
      "findContract__contractAddress",
      "changeCreatorFees__creatorFees",
    ];
    const contractAddress = (
      document.getElementById(inputsId[0]) as HTMLInputElement
    ).value;
    const creatorFees = (
      document.getElementById(inputsId[1]) as HTMLInputElement
    ).value;

    console.log(creatorFees);
    // make sure the client wants to do this
    if (
      !confirm(
        `Are you sure you want to change the creator fees to ${creatorFees}%?`
      )
    ) {
      return;
    }
    //set creatorFees only to two decimals
    var creatorFeesFloat = parseFloat(creatorFees).toFixed(2);

    //multipliy by 100 to get the right number and then parse to int to remove decimals
    var creatorFeesFixed = Math.round(parseFloat(creatorFeesFloat) * 100);
    prepareWriteContract({
      address: contractAddress as "0x${string}",
      abi: GmFam.abi,
      functionName: "changeCreatorFees",
      args: [creatorFeesFixed],
      account: address as "0x${string}",
    })
      .then((result) => {
        writeContract(result)
          .then((result) => {
            console.log(result);
            toast(`Hash: ${result.hash}`, {
              duration: 3000,
              position: "top-right",
              style: {
                wordWrap: "break-word",
                wordBreak: "break-all",
              },
            });
            toast.success(`Creator fees changed to ${creatorFeesFloat}%`, {
              duration: 3000,
              position: "top-right",
            });
          })
          .catch(handleErrorTransactionExecutionError);
      })
      .catch(handleErrorGmFamContracts);
  };

  const changeCostPerMint = async () => {
    const inputsId = [
      "findContract__contractAddress",
      "changeCostPerMint__costPerMint",
    ];
    const costPerMint = (
      document.getElementById(inputsId[1]) as HTMLInputElement
    ).value;
    console.log(costPerMint);
    const contractAddress = (
      document.getElementById(inputsId[0]) as HTMLInputElement
    ).value;
    // make sure the client wants to do this
    if (
      !confirm(
        `Are you sure you want to change the cost per mint to ${costPerMint} ETH?`
      )
    ) {
      return;
    }
    prepareWriteContract({
      address: contractAddress as "0x${string}",
      abi: GmFam.abi,
      functionName: "changeCost",
      args: [parseEther(costPerMint)],
      account: address as "0x${string}",
    })
      .then((result) => {
        writeContract(result)
          .then((result) => {
            toast(`Hash: ${result.hash}`, {
              duration: 3000,
              position: "top-right",
              style: {
                wordWrap: "break-word",
                wordBreak: "break-all",
              },
            });
            toast.success("Cost per mint changed", {
              duration: 3000,
              position: "top-right",
            });
          })
          .catch(handleErrorTransactionExecutionError);
      })
      .catch(handleErrorGmFamContracts);
  };

  const changeMaxTokenSize = async () => {
    const inputsId = [
      "findContract__contractAddress",
      "changeMaxTokenSize__maxTokenSize",
    ];
    const maxTokenSize = (
      document.getElementById(inputsId[1]) as HTMLInputElement
    ).value;
    console.log(maxTokenSize);
    const contractAddress = (
      document.getElementById(inputsId[0]) as HTMLInputElement
    ).value;
    // make sure the client wants to do this
    if (
      !confirm(
        `Are you sure you want to change the max token size to ${maxTokenSize}?`
      )
    ) {
      return;
    }
    prepareWriteContract({
      address: contractAddress as "0x${string}",
      abi: GmFam.abi,
      functionName: "changeMaxTokens",
      args: [maxTokenSize],
      account: address as "0x${string}",
    })
      .then((result) => {
        writeContract(result)
          .then((result) => {
            toast(`Hash: ${result.hash}`, {
              duration: 3000,
              position: "top-right",
              style: {
                wordWrap: "break-word",
                wordBreak: "break-all",
              },
            });
            toast.success("Max token size changed", {
              duration: 3000,
              position: "top-right",
            });
          })
          .catch(handleErrorTransactionExecutionError);
      })
      .catch(handleErrorGmFamContracts);
  };

  const transferBalance = async () => {
    const inputsId = [
      "findContract__contractAddress",
      "transferBalance__address",
      "transferBalance__amount",
    ];
    const addressTo = (document.getElementById(inputsId[1]) as HTMLInputElement)
      .value;
    const amount = (document.getElementById(inputsId[2]) as HTMLInputElement)
      .value;

    const contractAddress = (
      document.getElementById(inputsId[0]) as HTMLInputElement
    ).value;

    console.log(address);
    console.log(amount);

    // make sure the client wants to do this
    if (
      !confirm(`Are you sure you want to transfer ${amount} ETH to ${address}?`)
    ) {
      return;
    }
    prepareWriteContract({
      address: contractAddress as "0x${string}",
      abi: GmFam.abi,
      functionName: "transferFunds",
      args: [addressTo, parseEther(amount)],
      account: address as "0x${string}",
    })
      .then((result) => {
        writeContract(result)
          .then((result) => {
            toast(`Hash: ${result.hash}`, {
              duration: 3000,
              position: "top-right",
              style: {
                wordWrap: "break-word",
                wordBreak: "break-all",
              },
            });
            toast.success("Balance transfered", {
              duration: 3000,
              position: "top-right",
            });
          })
          .catch(handleErrorTransactionExecutionError);
      })
      .catch(handleErrorGmFamContracts);
  };

  const changeBaseURI = async () => {
    const inputsId = "changeBaseURI__prefix";
    const prefix = (document.getElementById(inputsId) as HTMLInputElement)
      .value;
    const inputsId2 = "changeBaseURI__setId";
    const setId = (document.getElementById(inputsId2) as HTMLInputElement)
      .value;
    const inputsId3 = "changeBaseURI__suffix";
    const suffix = (document.getElementById(inputsId3) as HTMLInputElement)
      .value;
    console.log(prefix);
    console.log(setId);
    console.log(suffix);
    const contractAddressId = "findContract__contractAddress";
    const contractAddress = (
      document.getElementById(contractAddressId) as HTMLInputElement
    ).value;

    if (prefix === "") {
      toast.error("Please enter a prefix", {
        duration: 2000,
        position: "top-right",
      });
      return;
    }
    // make sure the client wants to do this
    if (setId === "true") {
      if (
        !confirm(
          `Are you sure you want to change the base URI to ${prefix}<ID>${suffix}?`
        )
      ) {
        return;
      }
      var setIdFixed = true;
    } else {
      if (
        !confirm(
          `Are you sure you want to change the base URI to ${prefix}${suffix}?`
        )
      ) {
        return;
      }
      var setIdFixed = false;
    }

    prepareWriteContract({
      address: contractAddress as "0x${string}",
      abi: GmFam.abi,
      functionName: "changeBaseURI",
      args: [prefix, setIdFixed, suffix],
      account: address as "0x${string}",
    })
      .then((result) => {
        writeContract(result)
          .then((result) => {
            toast(`Hash: ${result.hash}`, {
              duration: 3000,
              position: "top-right",
              style: {
                wordWrap: "break-word",
                wordBreak: "break-all",
              },
            });
            toast.success("Base URI changed", {
              duration: 3000,
              position: "top-right",
            });
          })
          .catch(handleErrorTransactionExecutionError);
      })
      .catch(handleErrorGmFamContracts);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Admin Panel for your gm Fam! Collection</title>
        <meta
          content="Admin Panel for your gm Fam! Collection"
          name="Admin Panel for your gm Fam! Collection"
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

        <HamburgerMenu numberBlocker={4} />
      </header>
      <main className={styles.main}>
        {isClient && (
          <div>
            <div className={styles.containerForm__twoSideByside}>
              <div
                style={{
                  marginBottom: "10px",
                }}
              >
                <h1 className={styles.titleGm}>
                  Your gm Fam! Collection contract address
                </h1>
                <Input
                  placeholder="0x..."
                  backgroundColor={"gray.100"}
                  id="findContract__contractAddress"
                />
              </div>
            </div>
            <Select
              backgroundColor={statusMenu[1]}
              id="selectOption"
              onChange={findMenu}
              style={{
                marginBottom: "10px",
              }}
            >
              <option value="none">Select option</option>
              <option
                value="baseURI"
                style={{
                  backgroundColor: "#90CAF9",
                }}
              >
                Change base URI
              </option>
              <option
                value="creatorFees"
                style={{
                  backgroundColor: "#90CAF9",
                }}
              >
                Change creator fees
              </option>
              <option
                value="costPerMint"
                style={{
                  backgroundColor: "#90CAF9",
                }}
              >
                Change cost per mint
              </option>
              <option
                value="maxTokenSize"
                style={{
                  backgroundColor: "#90CAF9",
                }}
              >
                Change max token size
              </option>

              <option
                value="renounceOwnership"
                style={{
                  backgroundColor: "#EF9A9A",
                }}
              >
                Renounce and transfer ownership
              </option>
              <option
                value="transferBalance"
                style={{
                  backgroundColor: "#EF9A9A",
                }}
              >
                Transfer contract balance
              </option>
            </Select>

            <div className={styles.containerForm__twoSideByside}>
              {statusMenu[0] === "baseURI" && (
                <div>
                  <h1 className={styles.titleGm}>Change base URI</h1>
                  <div className={styles.containerForm__a}>
                    <p>Prefix</p>
                    <div>
                      <Input
                        size="sm"
                        type="text"
                        backgroundColor="gray.100"
                        placeholder="ipfs://gmfam.io/pfp"
                        id="changeBaseURI__prefix"
                      />
                    </div>
                    <div>
                      <div className={styles.containerForm__twoSideBysideDown}>
                        <div
                          style={{
                            marginRight: "10px",
                          }}
                        >
                          <p>Set ID</p>
                          <div>
                            <Select
                              size="sm"
                              defaultValue=""
                              backgroundColor="gray.100"
                              id="changeBaseURI__setId"
                            >
                              <option value="true">tokenId</option>
                              <option value="false">empty</option>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <p>Suffix</p>
                          <Input
                            size="sm"
                            type="text"
                            backgroundColor="gray.100"
                            placeholder="e.g. .json"
                            id="changeBaseURI__suffix"
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        paddingTop: "10px",
                      }}
                    ></div>
                  </div>
                  <Button colorScheme="blue" onClick={changeBaseURI}>
                    Set new base URI
                  </Button>
                </div>
              )}
              {statusMenu[0] === "creatorFees" && (
                <div>
                  <h1 className={styles.titleGm}>Change creator fees</h1>
                  <InputGroup size="sm">
                    <Input
                      size="sm"
                      type="number"
                      placeholder="0"
                      backgroundColor={
                        makeAlertFees[0] ? "red.400" : "gray.100"
                      }
                      id="changeCreatorFees__creatorFees"
                      width={"70px"}
                      onChange={(e) => {
                        var value = e.target.value;
                        if (
                          parseFloat(value) >= 0 &&
                          parseFloat(value) <= 100
                        ) {
                          if (parseFloat(value) >= 10) {
                            if (!makeAlertFees[1]) {
                              toast(
                                "We recommend to set the creator fees to less than 10%"
                              );
                              setMakeAlertFees([makeAlertFees[0], true]);
                            }
                            return;
                          } else {
                            setMakeAlertFees([false, makeAlertFees[1]]);
                          }
                        }
                        if (parseFloat(value) < 0 || parseFloat(value) > 100) {
                          setMakeAlertFees([true, makeAlertFees[1]]);
                        }
                      }}
                    />
                    <InputRightAddon>%</InputRightAddon>
                  </InputGroup>

                  <div
                    style={{
                      paddingTop: "10px",
                    }}
                  >
                    <Button onClick={changeCreatorFees} colorScheme="blue">
                      Set new creator fees
                    </Button>
                  </div>
                </div>
              )}
              {statusMenu[0] === "costPerMint" && (
                <div>
                  <h1 className={styles.titleGm}>Change cost per mint</h1>
                  <InputGroup size="sm">
                    <Input
                      width={"70px"}
                      size="sm"
                      type="number"
                      placeholder="0"
                      backgroundColor="gray.100"
                      id="changeCostPerMint__costPerMint"
                    />
                    <InputRightAddon>ETH</InputRightAddon>
                  </InputGroup>
                  <div
                    style={{
                      paddingTop: "10px",
                    }}
                  >
                    <Button colorScheme="blue" onClick={changeCostPerMint}>
                      Set new cost per mint
                    </Button>
                  </div>
                </div>
              )}
              {statusMenu[0] === "maxTokenSize" && (
                <div>
                  <h1 className={styles.titleGm}>Change max token size</h1>
                  <Input
                    size="sm"
                    type="number"
                    placeholder="0"
                    backgroundColor={"gray.100"}
                    id="changeMaxTokenSize__maxTokenSize"
                    width={"110px"}
                  />
                  <div
                    style={{
                      paddingTop: "10px",
                    }}
                  >
                    <Button colorScheme="blue" onClick={changeMaxTokenSize}>
                      Set new max token size
                    </Button>
                  </div>
                </div>
              )}
              {statusMenu[0] === "renounceOwnership" && (
                <div>
                  <h1 className={styles.titleGm}>
                    Renounce and transfer ownership
                  </h1>
                  <div
                    style={{
                      paddingBottom: "10px",
                    }}
                  >
                    <Input
                      size="sm"
                      type="text"
                      backgroundColor="gray.100"
                      placeholder="0x..."
                      id="changeOwner__address"
                    />
                  </div>
                  <Button colorScheme="blue" onClick={changeOwner}>
                    Transfer ownership
                  </Button>
                </div>
              )}
              {statusMenu[0] === "transferBalance" && (
                <div>
                  <h1 className={styles.titleGm}>Transfer contract balance</h1>
                  <div className={styles.containerForm__b}>
                    <p>Address to transfer balance to</p>
                    <Input
                      size="sm"
                      type="text"
                      placeholder="0x..."
                      backgroundColor="gray.100"
                      id="transferBalance__address"
                    />
                    <p>Amount to transfer</p>
                    <InputGroup size="sm">
                      <Input
                        width={"80px"}
                        size="sm"
                        type="number"
                        placeholder="0"
                        backgroundColor="gray.100"
                        id="transferBalance__amount"
                      />
                      <InputRightAddon>ETH</InputRightAddon>
                    </InputGroup>
                    <div
                      style={{
                        paddingTop: "10px",
                      }}
                    >
                      <Button colorScheme="green" onClick={transferBalance}>
                        Transfer balance
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <UniqueFooter />
    </div>
  );
};

export default Home;
