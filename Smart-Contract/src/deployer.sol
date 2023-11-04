// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.19;
/**
 *  @title Deployer for GmFam contract
 *  @notice This contract is used to deploy a GmFam contract
 */

import {GmFam} from "./GmFam.sol";

contract Deployer {
    error DeployerGmFam__NotEnoughEthSentToPayForDeployment();
    error DeployerGmFam__PaymentFailed();
    error NotOwner();
    error WithdrawFailed();

    address private owner;
    
    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert NotOwner();
        }
        _;
    }

    constructor(address _owner) {
        owner = _owner;
    }

    function deployContract(
        address _initialOwner,
        address _oldContract,
        string memory _nameOfToken,
        string memory _symbolOfToken,
        string memory _URIPrefix,
        bool _URIHasId,
        string memory _URISuffix,
        uint256 _costPerMint,
        uint96 _feeNumerator,
        uint256 _maxTokens
    ) public payable returns (address) {
        /// @notice check if enough ETH was sent to cover the cost of deployment
        ///         the cost of deployment is 0.02 ETH
        if (msg.value < 0.02 ether) {
            revert DeployerGmFam__NotEnoughEthSentToPayForDeployment();
        }
        if (payable(address(this)).send(msg.value)) {
            revert DeployerGmFam__PaymentFailed();
        }
        GmFam newContract = new GmFam(
            _initialOwner, 
            _oldContract, 
            _nameOfToken, 
            _symbolOfToken, 
            _URIPrefix, 
            _URIHasId, 
            _URISuffix, 
            _costPerMint, 
            _feeNumerator, 
            _maxTokens
        );
        return address(newContract);
    }

    function withdraw() public onlyOwner {
        (bool success,) = payable(owner).call{value: address(this).balance}("");
        if (!success) {
            revert WithdrawFailed();
        }
    }

    function getBalance() public view onlyOwner returns (uint256) {
        return address(this).balance;
    }
}
