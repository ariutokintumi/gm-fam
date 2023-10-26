import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { ContractFunctionExecutionError } from 'viem';
import { useEffect, useState } from 'react';
import { readContract, prepareWriteContract, writeContract } from '@wagmi/core'
import { useAccount } from 'wagmi';
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react';
import { FaRegClipboard, FaBars } from "react-icons/fa6";
import { parseEther } from 'viem';

import Deployer from '../abis/Deployer.json';
import { erc721ABI } from '@wagmi/core'

import ERC721 from '../abis/ERC721.json';
import clipboardCopy from 'clipboard-copy';


const deployerAddress = '0x9Ee492011c5C3Ac93d4CbB2B6877f23023b49D5D';
/*'0x2DD654ba96C472044ED51b76D7BCDbe48aEd775B';*/
// without set tokenURI
//'0x97eB2Df73bf4dd5dD4957de452Fa664efc50E0B4';
//w verifided contract
//'0x2C218888258ae395a28A7bAD5441d0FAdc6653fe';
// contract without creator fees
//'0x664eea899d3e954f89a01f7f26c2a518f8ae935f';
//contract without payable function in safeMnt
//'0x36bC8BFF90a669948f3A4ACA740Cb2a34840Ba8B';

function getCommonPrefix(str1: any, str2: any) {
  let i = 0;
  while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
    i++;
  }
  console.log('Common prefix:');
  console.log(str1.slice(0, i));
  return str1.slice(0, i);
}

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const handleCopyClick = async () => {
    try {
      await clipboardCopy(text);
    } catch (error) {
      console.error('Error to copy the text:', error);
    }
  };
  return (
    <Button onClick={handleCopyClick} size='sm'>
      <FaRegClipboard />
    </Button>
  );
};

const Home: NextPage = () => {
  const { address, isConnected } = useAccount();
  const [isClient, setIsClient] = useState(false);
  const [value, setValue] = useState('3');
  const [txData, setTxData] = useState<any>([false, '', '']);
  const [closeTopContainer, setCloseTopContainer] = useState(false);

  useEffect(() => {
    setIsClient(true);

  }, []);


  const getDeployerData = async (): Promise<void> => {

    const inputIds = [
      'getDeployerData__SourceAddress',
      'getDeployerData__CollectionName',
      'getDeployerData__CollectionTokenName',
      'getDeployerData__CollectionOwner',
      'getDeployerData__CreatorFees',
      'getDeployerData__CostPerMint',
      'getDeployerData__MaxTokens',
    ];
    const checkboxIds = [
      'getDeployerData__WitelistByTokenId',
      'getDeployerData__WitelistByWalletAddress',
    ];

    // pasar por todos excepto el de IPFS
    const inputs = inputIds.map((id) => {
      const input = document.getElementById(id) as HTMLInputElement;
      return input.value;
    });

    //marcar cuando falta algun input 
    if (inputs.some((input) => input === '')) {
      alert('Please fren fill all the inputs');
      return;
    }

    const checkboxes = checkboxIds.map((id) => {
      const checkbox = document.getElementById(id) as HTMLInputElement;
      return checkbox.checked;
    });

    var srcAddress = inputs[0];
    var collectionName = inputs[1];
    var collectionTokenName = inputs[2];
    var collectionOwner = inputs[3];
    var creatorFees = inputs[4];
    var costPerMint = inputs[5];
    var maxTokens = inputs[6];

    if (parseFloat(creatorFees) >= 100) {
      alert('Creator fees must be less than 100%');
      return;
    }
    //set creatorFees only to two decimals
    var creatorFeesFloat = parseFloat(creatorFees).toFixed(2);

    //multipliy by 100 to get the right number and then parse to int to remove decimals
    var creatorFeesFixed = Math.round(parseFloat(creatorFeesFloat) * 100);

    var prefix = '';
    var hasId = false;
    var suffix = '';
    const tokenURIMethods = ['tokenURI', 'uri']; // Acá podemos agregar otros métodos
    const tokenIdsToTry = [1, 2, 11, 12, 111, 112, 1001, 1002]; // Buscamos 2 tokenID pero sino sigue procurando, ya que a veces no están minteados algunos de numero bajo
    for (const method of tokenURIMethods) {

      for (let i = 0; i < tokenIdsToTry.length; i += 2) {
        console.log('Trying method', method);
        console.log('Trying tokenID', tokenIdsToTry[i], 'and', tokenIdsToTry[i + 1]);
        const tokenId1 = await readContract({
          address: srcAddress as '0x${string}',
          abi: erc721ABI,
          functionName: 'tokenURI',
          args: [BigInt(tokenIdsToTry[i])],
          account: address,
        });
        const tokenId2 = await readContract({
          address: srcAddress as '0x${string}',
          abi: erc721ABI,
          functionName: 'tokenURI',
          args: [BigInt(tokenIdsToTry[i + 1])],
          account: address,
        });
        console.log('TokenID1', tokenId1);
        console.log('TokenID2', tokenId2);

        const urlMatch1 = tokenId1.match(/^(.*:\/\/.*)(\d+)(.*)$/);
        const urlMatch2 = tokenId2.match(/^(.*:\/\/.*)(\d+)(.*)$/);

        console.log('urlMatch1', urlMatch1);
        console.log('urlMatch1', urlMatch1?.[1]);
        console.log('urlMatch2', urlMatch2?.[1]);

        if (!urlMatch1?.[1] || !urlMatch2?.[1]) {
          console.log("This metadata format is not supported yet");
          break;
        }

        if (urlMatch1?.[1] === urlMatch2?.[1]) {
          console.log('The tokens are all using the same metadata', urlMatch1?.[1]);
          prefix = urlMatch1?.[1].toString();
          prefix = getCommonPrefix(urlMatch1?.[1].toString(), urlMatch2?.[1].toString());
          var suffix1 = urlMatch1?.[3];
          var suffix2 = urlMatch2?.[3];
          if (suffix1 === suffix2 && suffix1 !== '') {
            console.log(`The token baseURI is ${prefix} and the suffix (after N) is ${suffix1}`);
            hasId = true;
            suffix = suffix1;
            console.log(prefix, suffix, hasId);
          } else {
            if (urlMatch1?.[2] === '') {
              console.log(`The token baseURI is ${prefix}`);
              console.log(prefix, suffix, hasId);
            } else {
              console.log(`The token baseURI is ${prefix} only has the tokenID ${urlMatch1?.[2]}`);
              hasId = true;
              console.log(prefix, suffix, hasId);
            }
          }
          break;
        }
      }
      if (prefix !== '') {

        prepareWriteContract({
          address: deployerAddress as '0x${string}',
          abi: Deployer.abi,
          functionName: 'deployContract',
          args: [
            collectionOwner,
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
        }).then((data) => {
          writeContract(data).then(() => {
            setTxData([true, data.result, collectionOwner]);
          }).catch((error) => {
            console.log(error);
          });
        }).catch((error) => {
          console.log(error);
        });
        break;
      }
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>gmFam!!</title>
        <meta
          content="gmFam"
          name="gmFam"
        />
        <link href="/favicon.png" rel="icon" />
      </Head>
      { !closeTopContainer && (
      <div className={styles.topContainer}>
        <div className={styles.topContainer__xContainer}>
          <Button
            className={styles.topContainer__xContainer__xButton}
            colorScheme='null'
            onClick={() => setCloseTopContainer(true)}
          >x</Button>
        </div>
        <div className={styles.topContainer__textContainer}>
          <h1>
            This is a alpha version of the gm Fam! app.
          </h1>
          <p>
            If you wamt to use the stable version go to:
          </p>
          <p>
          <a href="https://gm-fam-stable.vercel.app/">gm-fam-stable.vercel.app</a>
          </p>
          <br/>
          <p>
            Made with ❤️ by <a href="https://twitter.com/andrealbiac">@andrealbiac</a>, <a href="https://twitter.com/jistro">@jistro</a> and <a href="https://twitter.com/ariutokintumi">@ariutokintumi</a>
          </p>
        </div>
      </div>
      )}
      <header>
        <img src="/pink-logo.png" alt="RainbowKit Logo" height={100} width={100} />
        <ConnectButton />
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label='Options'
            icon={<FaBars />}
            colorScheme='green'
          />
          <MenuList >
            <MenuItem
              backgroundColor={'gray.600'}
              color={'white'}
            >
              Main page
            </MenuItem>
            <MenuItem onClick={() => window.location.href = '/mint'}>
              Mint
            </MenuItem>
            <MenuItem onClick={() => window.location.href = '/goBack'}>
              Go back to the original collection
            </MenuItem>

          </MenuList>
        </Menu>
      </header>
      <main className={styles.main}>

        {isClient && (
          <div
            style={{
              padding: '20px',
            }}
          >
            {txData[0] ? (
              <div>
                <center
                  style={{
                    paddingBottom: '20px',
                  }}
                >
                  <img
                    src="/mango-congrats.svg"
                    width={200} />
                  <h1
                    style={{
                      color: '#083f99',
                      fontSize: '30px',
                      fontWeight: 'bold',
                    }}
                  >
                    Congratulations fren!
                  </h1>
                </center>
                <Card >
                  <CardBody backgroundColor={'#98dcd7'}>
                    <p>Address of new contract:</p>
                    <p>{txData[1]} <CopyButton text={txData[1]} /></p>
                    <p>Collection owner:</p>
                    <p>{txData[2]} <CopyButton text={txData[2]} /></p>
                    <br />
                    < Button colorScheme='red' onClick={
                      () => setTxData([false, '', ''])
                    }>
                      Back
                    </Button>
                  </CardBody>
                </Card>

              </div>
            ) : (
              <>
                <div
                  style={{
                    paddingBottom: '20px',
                  }}
                >
                  Source of Collection Smart Contract Address
                  <Input size='sm' type="text" backgroundColor='gray.100' placeholder="To" id="getDeployerData__SourceAddress" />
                </div>
                <div
                className={styles.unavailableBox}
                onChange={(e) => {
                  alert('This feature is in development');
                  setValue('3');
                }}
                >
                  Metadata (in development)
                  <RadioGroup onChange={setValue} value={value} 
                  >
                    <Stack>
                      <Radio value='1' backgroundColor='gray.100' colorScheme='green'>
                        Use the original one
                      </Radio>
                      <Radio value='2' backgroundColor='gray.100' colorScheme='green'>
                        PIN on our IPFS node
                      </Radio>
                    </Stack>
                  </RadioGroup>
                </div>
                <div className={styles.container__twoSideByside}>
                  <div className={styles.container__a}>
                    <div>
                      New Collection Name
                      <Input size='sm' type="text" placeholder="" backgroundColor='gray.100' id="getDeployerData__CollectionName" />
                    </div>
                    <div>
                      <p>Max Tokens </p>
                      <p style={{ fontSize: '12px', color: 'gray' }}>
                        (this can cut the comunity size)
                      </p>
                      <Input size='sm' type="number" placeholder="" backgroundColor='gray.100' id="getDeployerData__MaxTokens" />
                    </div>
                    <div>
                      Creator fees
                      <InputGroup size='sm'>
                        <Input size='sm' type="number" placeholder="" backgroundColor='gray.100' id="getDeployerData__CreatorFees" />
                        <InputRightAddon>
                          %
                        </InputRightAddon>
                      </InputGroup>
                    </div>
                  </div>
                  <div className={styles.container__b}>
                    <div>
                      New Token Name
                      <Input size='sm' type="text" placeholder="" backgroundColor='gray.100' id="getDeployerData__CollectionTokenName" />
                    </div>
                    <div
                      className={styles.unavailableBox}
                      onChange={(e) => {
                        alert('This feature is in development');
                        setValue('3');
                      }}
                    >
                      Whitelist (In development)
                      <Stack spacing={0}>
                        <Checkbox
                          colorScheme='green'
                          id=''
                        >
                          By original token ID (Number)
                        </Checkbox>
                        <Checkbox
                          colorScheme='green'
                          id=''
                        >
                          By wallet address
                        </Checkbox>
                      </Stack>
                    </div>
                    <div>
                      Cost per mint
                      <InputGroup size='sm'>
                        <Input size='sm' type="number" placeholder="" backgroundColor='gray.100' id="getDeployerData__CostPerMint" />
                        <InputRightAddon>
                          ETH
                        </InputRightAddon>
                      </InputGroup>
                    </div>
                  </div>
                </div>
                <div>
                  New Collection Owner (User address or SAFE address)
                  <Input size='sm' type="text" placeholder="0x..." backgroundColor='gray.100' id="getDeployerData__CollectionOwner" />
                </div>
                <div
                  style={{
                    paddingTop: '20px',
                  }}
                >
                  <Button colorScheme='pink'
                    onClick={getDeployerData}
                  >
                    Deploy new contract
                  </Button>
                </div>
              </>)}
          </div>

        )}

      </main>

    </div >

  );
};

export default Home;
