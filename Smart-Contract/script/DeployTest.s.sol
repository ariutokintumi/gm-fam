// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import { Deployer } from "../src/deployer.sol";
import { DigitalCherry } from "../src/test/nft.sol";

contract DeployTest is Script {
    Deployer deploy;
    DigitalCherry nft;

    address adminAddress = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

    function run() public {
        vm.startBroadcast(adminAddress);
        deploy = new Deployer();
        nft = new DigitalCherry(adminAddress);
        console2.log("deploy address: ", address(deploy));
        console2.log("nft address: ", address(nft));
        nft.safeMint(adminAddress);
        address gmFam =deploy.deployContract(
            adminAddress,
            address(nft),
            "ForkCherry",
            "FCHY",
            "ipfs://QmWx3cFwFGAxd43AutywbqykKFDcvuvo8zG75Z7rKbzTPr/",
            true,
            ".json",
            0,
            0,
            100
        );
        console2.log("gmFam address: ", gmFam);

    }
}