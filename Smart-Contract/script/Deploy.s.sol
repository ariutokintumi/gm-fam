// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import { Deployer } from "../src/deployer.sol";
import { DigitalCherry } from "../src/test/nft.sol";

contract Deploy is Script {
    Deployer deploy;
    DigitalCherry nft;

    address adminAddress = 0xF11f8301C76F46733d855ac767BE741FFA9243Bd;

    function run() public {
        vm.startBroadcast(adminAddress);
        deploy = new Deployer();
        nft = new DigitalCherry(adminAddress);
        console2.log("deploy address: ", address(deploy));
        console2.log("nft address: ", address(nft));
        nft.safeMint(adminAddress);

    }
}