import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import toast, { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import { readContract, prepareWriteContract, writeContract } from "@wagmi/core";
import { useAccount } from "wagmi";
import {
  Input,
  RadioGroup,
  Stack,
  Radio,
  InputGroup,
  InputRightAddon,
  Checkbox,
  Button,
  Card,
  CardBody,
  Select,
  Alert,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useDisclosure,
  Divider,
  UnorderedList,
  ListItem,
  Spinner,
} from "@chakra-ui/react";
import { FaRegClipboard, FaXmark, FaCheck } from "react-icons/fa6";
import { parseEther } from "viem";
import Deployer from "../abis/Deployer.json";
import { erc721ABI } from "@wagmi/core";
import ERC721 from "../abis/ERC721.json";
import HamburgerMenu from "../components/hamburgerMenu";
import UniqueFooter from "../components/uniqueFooter";
import handleErrorGmFamContracts from "../components/errors/handleErrorGmFamContract";
import handleErrorTransactionExecutionError from "../components/errors/handleErrorTransactionExecutionError";
import LoadingAnimation from "../components/loadingAnimation";
import CopyButton from "../components/copyButton";
import handleErrorDeployer from "../components/errors/handleErrorDeployer";

const deployerAddress =
  process.env.NEXT_PUBLIC_ENABLE_LOCAL === "true"
    ? "0x5FbDB2315678afecb367f032d93F642f64180aa3"  // Deployer in anvil local net
    : "0xf2f7605e92124014A92803d06bbbFD9146c6d993"; // Deployer in sepolia testnet

function getCommonPrefix(str1: any, str2: any) {
  let i = 0;
  while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
    i++;
  }
  console.log("Common prefix:");
  console.log(str1.slice(0, i));
  return str1.slice(0, i);
}

const Home: NextPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { address, isConnected } = useAccount();
  const [isClient, setIsClient] = useState(false);
  const [typeMetadatavalue, setTypeMetadatavalue] = useState("");
  const [txData, setTxData] = useState<any>([false, "", ""]);
  const [URIdata, setURIdata] = useState<any>(["", false, ""]);
  const [stateIsFetching, setStateIsFetching] = useState("none");
  const [theUserAgree, setTheUserAgree] = useState(false);
  const [makeAlertFees, setMakeAlertFees] = useState(["gray.100", "black"]);
  const [originalContractText, setOriginalContractText] = useState("0x");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const ferchURI = async (): Promise<void> => {
    const inputIds = ["getDeployerData__SourceAddress"];

    const inputs = inputIds.map((id) => {
      const input = document.getElementById(id) as HTMLInputElement;
      return input.value;
    });

    if (inputs.some((input) => input === "")) {
      toast.error(
        `Please fill the Original Collection Smart Contract address to fetch the metadata URI`,
        {
          duration: 3000,
          position: "top-right",
        }
      );
      setTypeMetadatavalue("");
      return;
    }

    var srcAddress = inputs[0];
    var prefix = "";
    var hasId = false;
    var suffix = "";
    
    const tokenURIMethods = ["tokenURI", "uri"]; // Acá podemos agregar otros métodos
    const tokenIdsToTry = [1, 2, 11, 12, 111, 112, 1001, 1002]; // Buscamos 2 tokenID pero sino sigue procurando, ya que a veces no están minteados algunos de numero bajo
    setStateIsFetching("fetching");
    for (const method of tokenURIMethods) {
      
      for (let i = 0; i < tokenIdsToTry.length; i += 2) {
        console.log("Trying method", method);
        console.log(
          "Trying tokenID",
          tokenIdsToTry[i],
          "and",
          tokenIdsToTry[i + 1]
        );
        var tokenId1 = undefined;
        var tokenId2 = undefined;
        if (method === "tokenURI") {
        tokenId1 = await readContract({
          address: srcAddress as "0x${string}",
          abi: erc721ABI,
          functionName: "tokenURI",
          args: [BigInt(tokenIdsToTry[i])],
          account: address,
        }).catch((error) => {
          console.log(error);
        });
        tokenId2 = await readContract({
          address: srcAddress as "0x${string}",
          abi: erc721ABI,
          functionName: "tokenURI",
          args: [BigInt(tokenIdsToTry[i + 1])],
          account: address,
        }).catch((error) => {
          console.log(error);
        });
      } else {
        tokenId1 = await readContract({
          address: srcAddress as "0x${string}",
          abi: ERC721.abi,
          functionName: "uri",
          args: [BigInt(tokenIdsToTry[i])],
          account: address,
        }).catch((error) => {
          console.log(error);
        });
        tokenId2 = await readContract({
          address: srcAddress as "0x${string}",
          abi: ERC721.abi,
          functionName: "uri",
          args: [BigInt(tokenIdsToTry[i + 1])],
          account: address,
        }).catch((error) => {
          console.log(error);
        });
      }

        // verificar si el tokenID es o no undefined
        if (tokenId1 != undefined || tokenId2 != undefined) {
          console.log("TokenID1", tokenId1);
          console.log("TokenID2", tokenId2);

          const urlMatch1 = typeof tokenId1 === 'string' ? tokenId1.match(/^(.*:\/\/.*)(\d+)(.*)$/) : null;
          const urlMatch2 = typeof tokenId2 === 'string' ? tokenId2.match(/^(.*:\/\/.*)(\d+)(.*)$/) : null;

          console.log("urlMatch1", urlMatch1);
          console.log("urlMatch1", urlMatch1?.[1]);
          console.log("urlMatch2", urlMatch2?.[1]);

          if (!urlMatch1?.[1] || !urlMatch2?.[1]) {
            console.log("This metadata format is not supported yet");
            break;
          }

          if (urlMatch1?.[1] === urlMatch2?.[1]) {
            console.log(
              "The tokens are all using the same metadata",
              urlMatch1?.[1]
            );
            prefix = urlMatch1?.[1].toString();
            prefix = getCommonPrefix(
              urlMatch1?.[1].toString(),
              urlMatch2?.[1].toString()
            );
            var suffix1 = urlMatch1?.[3];
            var suffix2 = urlMatch2?.[3];
            if (suffix1 === suffix2 && suffix1 !== "") {
              console.log(
                `The token baseURI is ${prefix} and the suffix (after N) is ${suffix1}`
              );
              hasId = true;
              suffix = suffix1;
              console.log(prefix, suffix, hasId);
            } else {
              if (urlMatch1?.[2] === "") {
                console.log(`The token baseURI is ${prefix}`);
                console.log(prefix, suffix, hasId);
              } else {
                console.log(
                  `The token baseURI is ${prefix} only has the tokenID ${urlMatch1?.[2]}`
                );
                hasId = true;
                console.log(prefix, suffix, hasId);
              }
            }
            break;
          }
        } else {
          console.log("Some tokenID is undefined");
          console.log("TokenID1", tokenId1);
          console.log("TokenID2", tokenId2);
        }
      }
      if (prefix !== "") {
        setURIdata([prefix, hasId, suffix]);
        toast.success(`URI found`, {
          duration: 3000,
          position: "top-right",
        });
        setTypeMetadatavalue("1");
        setStateIsFetching("success");
        break;
      }
    }
    if (prefix === "") {
      toast.error(`URI not found`, {
        duration: 3000,
        position: "top-right",
      });
      setTypeMetadatavalue("2");
      setStateIsFetching("failed");
    }
  };

  const getDeployerData = async (): Promise<void> => {
    const inputIds = [
      "getDeployerData__SourceAddress",
      "getDeployerData__CollectionName",
      "getDeployerData__CollectionTokenName",
      "getDeployerData__CreatorFees",
      "getDeployerData__CostPerMint",
      "getDeployerData__MaxTokens",
    ];

    const inputs = inputIds.map((id) => {
      const input = document.getElementById(id) as HTMLInputElement;
      return input.value;
    });

    //cer por consola getDeployerData__Iagree

    console.log(typeMetadatavalue);
    if (typeMetadatavalue === "2") {
      const inputIds = [
        "getDeployerData__Prefix",
        "getDeployerData__setIDOrNot",
        "getDeployerData__Suffix",
      ];

      const inputs = inputIds.map((id) => {
        const input = document.getElementById(id) as HTMLInputElement;
        return input.value;
      });
      if (inputs[0] === "") {
        toast.error(`Please fill all the inputs`, {
          duration: 3000,
          position: "top-right",
        });
        return;
      }

      if (inputs[1] !== "true" && inputs[1] !== "false") {
        toast.error(`Please fill all the inputs`, {
          duration: 3000,
          position: "top-right",
        });
        return;
      }

      var prefix = inputs[0];
      var hasId = inputs[1] === "true" ? false : true;
      var suffix = inputs[2];
      setURIdata([prefix, hasId, suffix]);
    }

    //marcar cuando falta algun input
    if (inputs.some((input) => input === "")) {
      toast.error(`Please fill all the inputs`, {
        duration: 3000,
        position: "top-right",
      });
      return;
    }

    if (URIdata[0] === "") {
      toast.error(`Please fill all the inputs`, {
        duration: 3000,
        position: "top-right",
      });
      return;
    }

    var srcAddress = inputs[0];
    var collectionName = inputs[1];
    var collectionTokenName = inputs[2];
    var creatorFees = inputs[3];
    var costPerMint = inputs[4];
    var maxTokens = inputs[5];
    var prefix = URIdata[0] as string;
    var hasId = URIdata[1] as boolean;
    var suffix = URIdata[2] as string;

    if (parseFloat(creatorFees) >= 100) {
      toast.error(`Creator fees must be less than 100%`, {
        duration: 3000,
        position: "top-right",
      });
      return;
    }
    if (parseFloat(creatorFees) < 0) {
      toast.error(`Creator fees must be more than 0%`, {
        duration: 3000,
        position: "top-right",
      });
      return;
    }

    //set creatorFees only to two decimals
    var creatorFeesFloat = parseFloat(creatorFees).toFixed(2);

    //multipliy by 100 to get the right number and then parse to int to remove decimals
    var creatorFeesFixed = Math.round(parseFloat(creatorFeesFloat) * 100);

    prepareWriteContract({
      address: deployerAddress as "0x${string}",
      abi: Deployer.abi,
      functionName: "deployContract",
      args: [
        address,
        srcAddress,
        collectionName,
        collectionTokenName,
        prefix,
        hasId,
        suffix,
        parseEther(costPerMint),
        creatorFeesFixed,
        parseInt(maxTokens),
      ],
      account: address,
      value: parseEther("0.02"),
    })
      .then((data) => {
        var tx = data.result;
        writeContract(data)
          .then((data) => {
            console.log(data);
            setTxData([true, tx, address]);
          })
          .catch(handleErrorTransactionExecutionError);
      })
      .catch(handleErrorDeployer);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create gm Fam!</title>
        <meta
          content="With this tool you can wrap your NFT collection into a new contract with new features like a whitelist, creator fees and more!"
          name="Create gm Fam!"
        />
        <link href="/favicon.png" rel="icon" />
      </Head>
      <header>
        <img src="/pink-logo.png" alt="gm Fam! logo" />

        <HamburgerMenu numberBlocker={1} />
      </header>
      <main className={styles.main}>
        {isClient && (
          <div
            style={{
              padding: "20px",
            }}
          >
            {txData[0] ? (
              <div>
                <center
                  style={{
                    paddingBottom: "20px",
                  }}
                >
                  <img src="/mango-congrats.svg" alt="congrats" width={200} />
                  <h1
                    style={{
                      color: "#083f99",
                      fontSize: "30px",
                      fontWeight: "bold",
                    }}
                  >
                    Congratulations!
                  </h1>
                </center>
                <Card>
                  <CardBody backgroundColor={"#98dcd7"}>
                    <p>Address of new contract:</p>
                    <p>
                      {txData[1]} <CopyButton text={txData[1]} />
                    </p>
                    <p>Collection owner:</p>
                    <p>
                      {txData[2]} <CopyButton text={txData[2]} />
                    </p>
                    <br />
                    <Button
                      colorScheme="red"
                      onClick={() => {
                        setTxData([false, "", ""]);
                        setTheUserAgree(!theUserAgree);
                        setTypeMetadatavalue("");
                        setStateIsFetching("none");
                        setURIdata(["", false, ""]);
                      }}
                    >
                      Back
                    </Button>
                  </CardBody>
                </Card>
              </div>
            ) : (
              <>
                <div className={styles.containerForm__a}>
                  <h1>Original Collection Smart Contract address</h1>
                  <Input
                    size="sm"
                    type="text"
                    backgroundColor="gray.100"
                    placeholder="0x..."
                    id="getDeployerData__SourceAddress"
                    onChange={() => {
                      var input = document.getElementById(
                        "getDeployerData__SourceAddress"
                      ) as HTMLInputElement;
                      setOriginalContractText(input.value);
                    }}
                  />
                </div>
                <div>
                  <div className={styles.containerForm__metadataRadio}>
                    <h1>Metadata</h1>

                    <RadioGroup
                      onChange={setTypeMetadatavalue}
                      value={typeMetadatavalue}
                    >
                      <Stack spacing={0}>
                        <Radio
                          value="1"
                          backgroundColor="gray.100"
                          colorScheme="green"
                          onChange={ferchURI}
                        >
                          <h2>
                            Try to fetch from the Original Smart Contract{" "}
                            {stateIsFetching === "fetching" && (
                              <Spinner size="xs" />
                            )}
                          </h2>
                        </Radio>
                        <Radio
                          value="2"
                          backgroundColor="gray.100"
                          colorScheme="green"
                        >
                          <h2>Create my own URI constructor</h2>
                        </Radio>
                      </Stack>
                    </RadioGroup>
                  </div>
                  {typeMetadatavalue === "2" && (
                    <div
                      className={styles.containerForm__twoSideByside}
                      style={{
                        marginLeft: "1px",
                      }}
                    >
                      <div className={styles.containerForm__uri}>
                        <p>Prefix</p>
                        <div className={styles.containerForm_Prefix}>
                          <Input
                            size="sm"
                            type="text"
                            backgroundColor="gray.100"
                            placeholder="ipfs://gmfam.io/pfp"
                            id="getDeployerData__Prefix"
                          />
                        </div>
                      </div>
                      <div className={styles.containerForm__uri}>
                        <div className={styles.containerForm__twoSideByside}>
                          <div className={styles.containerForm__uri}>
                            <p>Token ID</p>
                            <div className={styles.containerForm_SetID}>
                              <Select
                                size="sm"
                                defaultValue=""
                                backgroundColor="gray.100"
                                id="getDeployerData__setIDOrNot"
                              >
                                <option value="true">tokenId</option>
                                <option value="false">empty</option>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <p>Suffix</p>
                            <div className={styles.containerForm_Sufix}>
                              <Input
                                size="sm"
                                type="text"
                                backgroundColor="gray.100"
                                placeholder="E.g. .json"
                                id="getDeployerData__Suffix"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className={styles.containerForm__twoSideByside}>
                    <div className={styles.containerForm__a}>
                      <h1>New Collection Name</h1>
                      <Input
                        size="sm"
                        type="text"
                        placeholder="gm Fam! Token"
                        backgroundColor="gray.100"
                        id="getDeployerData__CollectionName"
                      />
                    </div>
                    <div className={styles.containerForm__b}>
                      <h1>New Token Name</h1>
                      <Input
                        size="sm"
                        type="text"
                        placeholder="GMTK"
                        backgroundColor="gray.100"
                        id="getDeployerData__CollectionTokenName"
                      />
                    </div>
                  </div>
                  <div className={styles.containerForm__twoSideByside}>
                    <div className={styles.containerForm__a}>
                      <h1>Max Tokens (NFTs) </h1>
                      <p>(this can cut the comunity size)</p>
                      <div className={styles.containerForm_MaxTokens}>
                        <Input
                          size="sm"
                          type="number"
                          placeholder="0"
                          backgroundColor="gray.100"
                          id="getDeployerData__MaxTokens"
                        />
                      </div>
                    </div>
                    <div className={styles.containerForm__b}>
                      <h1>Whitelist</h1>
                      <div className={styles.unavailableBox}>
                        <Stack spacing={0}>
                          <Checkbox colorScheme="green" id="" disabled>
                            By original token ID (Number)
                          </Checkbox>
                          <Checkbox colorScheme="green" id="" disabled>
                            By wallet address
                          </Checkbox>
                        </Stack>
                        <div className={styles.unavailableBox__overlay}>
                          <h1>This feature is in development</h1>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.containerForm__twoSideByside}>
                    <div className={styles.containerForm__a}>
                      <h1>Creator fees</h1>
                      <div className={styles.containerForm_CreatorFees}>
                        <InputGroup size="sm">
                          <Input
                            size="sm"
                            type="number"
                            placeholder="0"
                            backgroundColor={makeAlertFees[0]}
                            textColor={makeAlertFees[1]}
                            id="getDeployerData__CreatorFees"
                            onChange={(e) => {
                              var value = e.target.value;
                              if (
                                parseFloat(value) >= 0 &&
                                parseFloat(value) <= 100
                              ) {
                                if (
                                  parseFloat(value) > 10 &&
                                  parseFloat(value) <= 100
                                ) {
                                  setMakeAlertFees(["gray.100", "orange.500"]);
                                } else {
                                  setMakeAlertFees(["gray.100", "black"]);
                                }
                              }
                              if (
                                parseFloat(value) < 0 ||
                                parseFloat(value) > 100
                              ) {
                                setMakeAlertFees(["red.200", "black"]);
                              }
                            }}
                          />
                          <InputRightAddon>%</InputRightAddon>
                        </InputGroup>
                      </div>
                      {makeAlertFees[1] === "orange.500" && (
                        <p>We recommend to set the creator fees below 10%</p>
                      )}
                      {makeAlertFees[0] === "red.200" && (
                        <p>Creator fees must be between 0% and 100%</p>
                      )}
                    </div>
                    <div className={styles.containerForm__b}>
                      <h1>Cost per mint</h1>
                      <div className={styles.containerForm_CostPerMint}>
                        <InputGroup size="sm">
                          <Input
                            size="sm"
                            type="number"
                            placeholder="0"
                            backgroundColor="gray.100"
                            id="getDeployerData__CostPerMint"
                          />
                          <InputRightAddon>ETH</InputRightAddon>
                        </InputGroup>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={styles.containerForm__a}
                  style={{
                    marginTop: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <Checkbox
                    colorScheme="green"
                    id="getDeployerData__Iagree"
                    onChange={() => setTheUserAgree(!theUserAgree)}
                    borderColor={"#416663"}
                  >
                    <p>
                      I&apos;m understand the 0.02 ETH fee and the{" "}
                      <a
                        onClick={onOpen}
                        style={{
                          color: "#7A79FF",
                          fontWeight: "bold",
                        }}
                      >
                        terms &amp; Conditions
                      </a>
                    </p>
                  </Checkbox>
                </div>

                <Modal isOpen={isOpen} onClose={onClose}>
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>Terms &amp; Conditions</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                      <UnorderedList>
                        <ListItem>
                          I&apos;m fully authorized and I have the full rights
                          to create a new wrapping Smart Contract of the
                          Original Collection ({originalContractText}) and
                          I&apos;m not infringing any third party intellectual
                          property rights and/or incurring in any other illegal
                          activity deploying this new wrapping Smart Contract.
                        </ListItem>
                        <ListItem>
                          I accept a 0.02 ETH fee for the concept of the use of
                          tihs Interface + network gas fees. I also understand
                          that this Interface just sends a transaction to the
                          Deployer Smart Contract ({deployerAddress}) which will
                          create the new wrapping Smart Contract and I have
                          personally audited to understand it&apos;s behaviour.
                        </ListItem>
                      </UnorderedList>
                    </ModalBody>
                    <ModalFooter>
                      <Button colorScheme="blue" mr={3} onClick={onClose}>
                        Close
                      </Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>

                <div className={styles.containerForm__a}>
                  {theUserAgree && isConnected ? (
                    <Button colorScheme="blue" onClick={getDeployerData}>
                      Deploy new gm Fam! Smart Contract
                    </Button>
                  ) : (
                    <Button colorScheme="gray" isDisabled>
                      Deploy new gm Fam! Smart Contract
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <UniqueFooter />
    </div>
  );
};

export default Home;
