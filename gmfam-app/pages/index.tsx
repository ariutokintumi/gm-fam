import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { ContractFunctionExecutionError } from 'viem';
import { useEffect, useState } from 'react';
import { readContract, prepareWriteContract, writeContract } from '@wagmi/core'
import { useAccount } from 'wagmi';
import { Input, RadioGroup, Stack, Radio, InputGroup, InputRightAddon, Checkbox, Button, CardHeader, Card, CardBody, Heading } from '@chakra-ui/react';
import { FaRegClipboard } from "react-icons/fa6";

import Deployer from '../abis/Deployer.json';
import ERC721 from '../abis/ERC721.json';
import clipboardCopy from 'clipboard-copy';



const deployerAddress = '0x9a7B0a7d8f032e1f2F41a391bBeF97872C96F3f5';

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const handleCopyClick = async () => {
    try {
      await clipboardCopy(text);
      alert('Copiado al portapapeles');
    } catch (error) {
      console.error('Error al copiar el texto:', error);
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
  const [value, setValue] = useState('1');
  const [uriAux, setUriAux] = useState<any>('');
  const [txData, setTxData] = useState<any>([false, '', '']);

  useEffect(() => {
    setIsClient(true);
    
  }, []);


  const getDeployerData = () => {
    const inputIds = [
      'getDeployerData__SourceAddress',
      'getDeployerData__CollectionName',
      'getDeployerData__CollectionTokenName',
      'getDeployerData__CollectionOwner',
      'getDeployerData__CreatorFees',
      'getDeployerData__CostPerMint',
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


    var ipfsUrl: any = '';
    if (inputs[6] !== '') {
      ipfsUrl = inputs[6];
    } else {
      readContract({
        address: srcAddress as '0x${string}',
        abi: ERC721.abi,
        functionName: 'tokenURI',
        args: [],
        account: address,
      }).then((data) => {
        console.log(data);
        ipfsUrl = data;
        ipfsUrl=ipfsUrl.toString();
        ipfsUrl=ipfsUrl.match(/ipfs:\/\/[^/]+/);
      }).catch((error) => {
        console.log(error);
      });
    }

    var whitelistByTokenId = checkboxes[0];
    var whitelistByWalletAddress = checkboxes[1];

    prepareWriteContract({
      address: deployerAddress as '0x${string}',
      abi: Deployer.abi,
      functionName: 'deployContract',

      args: [
        collectionOwner,
        srcAddress,
        collectionName,
        collectionTokenName,
        ipfsUrl,
        costPerMint
      ],
      account: address,
    }).then((data) => {
      writeContract(data).then(() => {
        setTxData([true, data.result, collectionOwner]);
      });
    }).catch((error) => {
      console.log(error);
    });

  }

  return (
    <div className={styles.container}>
      <Head>
        <title>gmFam!!</title>
        <meta
          content="gmFam"
          name="gmFam"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>
      <header>
        <img src="/logo.png" alt="RainbowKit Logo" height={100} width={100} />
      </header>
      <main className={styles.main}>
        <ConnectButton />
        {isClient && (
          <div
            style={{
              padding: '20px',
            }}
          >
            {txData[0] ? (
              <div>
                <h1
                  style={{
                    color: '#083f99',
                    fontSize: '30px',
                    fontWeight: 'bold',
                  }}
                >
                  Congratulations fren!
                </h1>
                <Card variant='filled'>
                  <CardBody>
                    <p>Address of new contract: {txData[1]} <CopyButton text={txData[1]} /></p>
                    <p>Collection owner: {txData[2]} <CopyButton text={txData[2]} /></p>
                  </CardBody>
                </Card>
              </div>
            ) : (
              <>
                <div>
                  Source of Collection Smart Contract Address
                  <Input size='sm' type="text" backgroundColor='gray.100' placeholder="To" id="getDeployerData__SourceAddress" />
                </div>
                <div>
                  Metadata
                  <RadioGroup onChange={setValue} value={value} >
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
                      <Input size='sm' type="number" placeholder="" backgroundColor='gray.100' id="getDeployerData__CollectionName" />
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
                    <div>
                      Whitelist (optional)
                      <Stack spacing={1}>
                        <Checkbox
                          colorScheme='green'
                          id='getDeployerData__WitelistByTokenId'
                          defaultChecked
                        >
                          By original token ID (Number)
                        </Checkbox>
                        <Checkbox
                          colorScheme='green'
                          id='getDeployerData__WitelistByWalletAddress'
                          defaultChecked
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

      <footer className={styles.footer}>
        <a href="https://rainbow.me" rel="noopener noreferrer" target="_blank">
          Made with ❤️ by your frens at 🌈
        </a>
      </footer>
    </div >

  );
};

export default Home;
