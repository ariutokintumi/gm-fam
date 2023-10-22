// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.19;

import {GmFam} from "./GmFam.sol";

contract Deployer {

    function deployContract(
        address initialOwner, 
        address _oldContract, 
        string memory nameOfToken, 
        string memory symbolOfToken,
        string memory _baseURI,
        uint256 _costPerMint
    ) public returns (address) {
        GmFam newContract = new GmFam(initialOwner, _oldContract, nameOfToken, symbolOfToken, _baseURI, _costPerMint);
        return address(newContract);
    }
}