import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { ContractFunctionExecutionError, parseEther } from 'viem';
import { useEffect, useState } from 'react';
import { readContract, prepareWriteContract, writeContract } from '@wagmi/core'
import { useAccount, useContractRead } from 'wagmi';
import { Input, RadioGroup, Stack, Radio, InputGroup, InputRightAddon, Checkbox, Button, CardHeader, Card, CardBody, Heading, Center } from '@chakra-ui/react';
import { FaRegClipboard } from "react-icons/fa6";

import Deployer from '../abis/Deployer.json';
import GmFam from '../abis/GmFam.json';
import ERC721 from '../abis/ERC721.json';
import clipboardCopy from 'clipboard-copy';


const deployerAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
//const deployerAddress = '0x9a7B0a7d8f032e1f2F41a391bBeF97872C96F3f5';

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
    const handleCopyClick = async () => {
        try {
            await clipboardCopy(text);
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
    const [permissionGranted, setPermissionGranted] = useState(false);

    useEffect(() => {
        setIsClient(true);

    }, []);
    


    const givePermission = () => {
        const inputIds = [
            'SourceAddress',
            'mint_id',
            'mint_old_contract_address',
        ];

        // pasar por todos
        const inputs = inputIds.map((id) => {
            const input = document.getElementById(id) as HTMLInputElement;
            return input.value;
        });

        //marcar cuando falta algun input
        if (inputs.some((input) => input === '')) {
            alert('Please fren fill all the inputs');
            return;
        }

        var srcAddress = inputs[0];
        var tokenId = inputs[1];
        var oldContractAddress = inputs[2];

        prepareWriteContract({
            address: oldContractAddress as '0x${string}',
            abi: ERC721.abi,
            functionName: 'approve',

            args: [
                srcAddress,
                tokenId
            ],
            account: address,
        }).then((data) => {
            writeContract(data).then(() => {
                setPermissionGranted(true);
                alert('Permission granted');
            });
        }).catch((error) => {
            console.log(error);
        });
    }

    const safeMint = () => {
        const inputIds = [
            'SourceAddress',
            'mint_id',
            'mint_old_contract_address',
        ];

        // pasar por todos
        const inputs = inputIds.map((id) => {
            const input = document.getElementById(id) as HTMLInputElement;
            return input.value;
        });

        //marcar cuando falta algun input
        if (inputs.some((input) => input === '')) {
            alert('Please fren fill all the inputs');
            return;
        }

        var srcAddress = inputs[0];
        var tokenId = inputs[1];
        var oldContractAddress = inputs[2];
        console.log(srcAddress);
        //leer variable costPerMint
        var costPerMint = 0;
        readContract({
            address: srcAddress as '0x${string}',
            abi: GmFam.abi,
            args: [],
            functionName: 'readCost',
            account: address,
        }).then((data) => {
            console.log(data);
            costPerMint = data as number;
        }).catch((error) => {
            console.log(error);
        });

        // variable float priceEth

        prepareWriteContract({
            address: srcAddress as '0x${string}',
            abi: GmFam.abi,
            functionName: 'safeMint',
            args: [
                tokenId
            ],
            
            account: address,
        }).then((data) => {
            writeContract(data).then(() => {
                alert('Minted');
            });
        }).catch((error) => {
            console.log(error);
        });
    }

    const byeBye = () => {
        const inputIds = [
            'SourceAddress',
            'bye_id',
        ];

        // pasar por todos
        const inputs = inputIds.map((id) => {
            const input = document.getElementById(id) as HTMLInputElement;
            return input.value;
        });

        //marcar cuando falta algun input
        if (inputs.some((input) => input === '')) {
            alert('Please fren fill all the inputs');
            return;
        }
        
        var srcAddress = inputs[0];
        var tokenId = inputs[1];
        

        prepareWriteContract({
            address: srcAddress as '0x${string}',
            abi: GmFam.abi,
            functionName: 'byeBye',
            args: [
                tokenId
            ],
            account: address,
        }).then((data) => {
            writeContract(data).then(() => {
                alert('Burned');
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
                                    Smart Contract Address
                                    <Input size='sm' type="text" backgroundColor='gray.100' placeholder="To" id="SourceAddress" />
                                </div>
                                <div className={styles.container__twoSideByside}>
                                    <div className={styles.container__a}>
                                        <h1
                                            style={{
                                                color: '#083f99',
                                                fontSize: '40px',
                                                fontWeight: 'bold',
                                            }}
                                        >Mint</h1>
                                        <div>
                                            ID
                                            <Input size='sm' type="number" placeholder="" backgroundColor='gray.100' id="mint_id" />
                                        </div>
                                        <div>
                                            <p>Old contract address</p>
                                            <Input size='sm' type="text" placeholder="" backgroundColor='gray.100' id="mint_old_contract_address" />
                                        </div>
                                        <div
                                            style={{
                                                paddingTop: '30px',
                                            }}>
                                            {!permissionGranted ? (
                                            <Button colorScheme='blue'
                                                onClick={givePermission}
                                            >
                                                Give me your nft fren
                                            </Button>
                                            ) : (
                                                <Button colorScheme='blue'
                                                    onClick={safeMint}
                                                >
                                                    Mint
                                                </Button>
                                            )}
                                        </div>
                                        
                                    </div>
                                    <div className={styles.container__b}>
                                        <h1
                                            style={{
                                                color: '#083f99',
                                                fontSize: '40px',
                                                fontWeight: 'bold',
                                            }}
                                        >Bye bye</h1>
                                        <div>
                                            ID
                                            <Input size='sm' type="text" placeholder="" backgroundColor='gray.100' id="bye_id" />
                                        </div>
                                        <div
                                            style={{
                                                paddingTop: '80px',
                                            }}>
                                            <Button colorScheme='pink'
                                                onClick={byeBye}
                                            >
                                                Bye :c
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                            </>)}
                    </div>

                )}

            </main>


        </div >

    );
};

export default Home;
