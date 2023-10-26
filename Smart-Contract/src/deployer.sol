// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.19;

import {GmFam} from "./GmFam.sol";

contract Deployer {

    function deployContract(
        address initialOwner, 
        address _oldContract, 
        string memory nameOfToken, 
        string memory symbolOfToken,
    string memory _URIPrefix,
    bool _URIHasId,
    string memory _URISuffix,
        uint256 _costPerMint,
        uint96 feeNumerator,
        uint256 _maxTokens
    ) public returns (address) {
        GmFam newContract = new GmFam(
            initialOwner, 
            _oldContract, 
            nameOfToken, 
            symbolOfToken, 
            _URIPrefix, 
            _URIHasId, 
            _URISuffix, 
            _costPerMint, 
            feeNumerator, 
            _maxTokens
        );
        return address(newContract);
    }
}