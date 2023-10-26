// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import { Deployer } from "../src/deployer.sol";
import { DigitalCherry } from "../src/test/nft.sol";

contract DeployGmFam is Script {
    Deployer deploy;

    address adminAddress = 0xcb9C3Ad82b9255b3AB86e774fcAE787428e4b173;

    function run() public {
        vm.startBroadcast(adminAddress);
        deploy = new Deployer();
        console2.log("deploy address: ", address(deploy));

    }
}