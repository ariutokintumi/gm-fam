import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { ContractFunctionExecutionError, parseEther } from 'viem';
import { useEffect, useState } from 'react';
import { readContract, prepareWriteContract, writeContract } from '@wagmi/core'
import { useAccount, useContractRead } from 'wagmi';
import {
    Input,
    Button,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
} from '@chakra-ui/react';
import { FaRegClipboard, FaBars } from "react-icons/fa6";

import GmFam from '../abis/GmFam.json';



const Home: NextPage = () => {
    const { address, isConnected } = useAccount();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);

    }, []);

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
                <title>gm Fam! -- Go back</title>
                <meta
                    content="gm Fam! -- go back to the original collection"
                    name="gm Fam!-- go back to the original collection"
                />
                <link href="/favicon.png" rel="icon" />
            </Head>
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
                        <MenuItem onClick={() => window.location.href = '/'}>
                            Main page
                        </MenuItem>
                        <MenuItem onClick={() => window.location.href = '/mint'}>
                            Mint
                        </MenuItem>
                        <MenuItem
                            backgroundColor={'gray.600'}
                            color={'white'}
                        >
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
                        <div className={styles.container__form}>
                            <div className={styles.container__form__header}>
                                <img
                                    src="/fresa-text-back.svg"
                                    alt="gmFam Logo"

                                />
                                <h1
                                    style={{
                                        color: '#083f99',
                                        fontSize: '25px',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    Go back to the original collection
                                </h1>
                            </div>
                            <div>
                                gm Fam! Deployed Smart Contract
                                <Input size='sm' type="text" backgroundColor='gray.100' placeholder="0x..." id="SourceAddress" />
                            </div>
                            <div>
                                ID
                                <Input size='sm' type="number" placeholder="0" backgroundColor='gray.100' id="bye_id" />
                            </div>
                            <div
                                style={{
                                    paddingTop: '1rem',
                                }}>
                                <Button colorScheme='pink'
                                    onClick={byeBye}
                                >
                                    Bye :c
                                </Button>
                            </div>

                        </div>

                    </div>
                )}
            </main>
        </div >
    );
};

export default Home;
