// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import { Deployer } from "../src/deployer.sol";
import { MemeNFT } from "../src/test/nft.sol";

contract DeployTest is Script {
    Deployer deploy;
    MemeNFT nft;

    address adminAddress = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

    function run() public {
        vm.startBroadcast(adminAddress);
        deploy = new Deployer();
        nft = new MemeNFT(adminAddress);
        console2.log("deploy address: ", address(deploy));
        console2.log("nft address: ", address(nft));

    }
}