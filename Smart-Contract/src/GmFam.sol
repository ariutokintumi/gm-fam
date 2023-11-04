// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

/**
 * @title GmFam contract
 * @notice This contract is used to mint a fork wrapped version of the original nft contract
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";

contract GmFam is ERC721, ERC721Burnable, ERC721Royalty, Ownable {
    error GmFam__YouAreNotTheOwner();
    error GmFam__YouMUSTPayForMint();
    error GmFam__TransferFailed();
    error GmFam__NotEnoughFunds();
    error GmFam__MaxSupplyReached();
    error GmFam__CantDecreaseMaxSupply();

    address originalContractAddress;
    uint256 public costPerMint;
    string URIPrefix;
    bool URIHasId;
    string URISuffix;
    uint256 public maxTokens;
    uint256 public counter;

    //------------------------------------//
    //           Constructor              //
    //------------------------------------//
    constructor(
        address initialOwner,
        address _originalContractAddress,
        string memory _nameOfToken,
        string memory _symbolOfToken,
        string memory _URIPrefix,
        bool _URIHasId,
        string memory _URISuffix,
        uint256 _costPerMint,
        uint96 _feeNumerator,
        uint256 _maxTokens
    ) ERC721(_nameOfToken, _symbolOfToken) Ownable(initialOwner) {
        originalContractAddress = _originalContractAddress;
        URIPrefix = _URIPrefix;
        URIHasId = _URIHasId;
        URISuffix = _URISuffix;
        maxTokens = _maxTokens;
        /// @dev Sets the cost per mint
        uint256 priceInEth = _costPerMint;
        costPerMint = priceInEth;
        /// @dev Sets the royalty fee for the contract
        ///      feeNumerator is in basis points (1/100 of a percent)
        ///      10000 = 100%
        ///      250 = 2.5%
        _setDefaultRoyalty(address(this), _feeNumerator);
    }

    //------------------------------------//
    //   Receive and Fallback Functions   //
    //------------------------------------//
    receive() external payable {}
    fallback() external payable {}
    //------------------------------------//
    //          Public Functions          //
    //------------------------------------//

    /// @notice This next functions can be use by anyone

    /**
     *  Mint a wrapped version of the original token
     *
     *  @notice This function is used to mint a token
     *          For this function to work you need to have the token you want to mint
     *          in this contract and before calling this function you need to call the
     *          approve function from the original contract
     *
     *  @param tokenId The id of the token you want to mint
     */
    function safeMint(uint256 tokenId) public payable {
        if (counter >= maxTokens) {
            revert GmFam__MaxSupplyReached();
        }
        if (msg.value < costPerMint) {
            revert GmFam__YouMUSTPayForMint();
        }
        if (msg.sender != ERC721(originalContractAddress).ownerOf(tokenId)) {
            revert GmFam__YouAreNotTheOwner();
        }
        /// @notice Verifies that the contract has the funds to pay for the mint
        if (!payable(address(this)).send(msg.value)) {
            revert GmFam__TransferFailed();
        }
        /// @notice Transfers the token from the original contract to this contract
        ERC721(originalContractAddress).transferFrom(msg.sender, address(this), tokenId);
        _safeMint(msg.sender, tokenId);
        counter++;
    }

    /**
     *  unwrap a wrapped version of the original token
     *
     *  @param tokenId the id of the token you want to unwrap
     *
     *  @notice This function is used to unwrap a token and get the original token back
     *          For this function to work you need to have the token you want to unwrap
     */
    function goBackToOriginalCollection(uint256 tokenId) public {
        if (msg.sender != ownerOf(tokenId)) {
            revert GmFam__YouAreNotTheOwner();
        }
        ERC721(originalContractAddress).safeTransferFrom(address(this), msg.sender, tokenId);
        /// @dev This is the burn function from ERC721Burnable
        _burn(tokenId);
        counter--;
    }

    /// @notice This next functions can only be use by the owner
    ///         we understand as owner as a address account that has the role of owner
    
    function transferFunds(address payable to, uint256 amount) public onlyOwner {
        if (address(this).balance < amount) {
            revert GmFam__NotEnoughFunds();
        }
        if (!payable(to).send(amount)) {
            revert GmFam__TransferFailed();
        }
    }

    function changeCreatorFees(uint96 _feeNumerator) public onlyOwner {
        _setDefaultRoyalty(address(this), _feeNumerator);
    }

    function changeBaseURI(string memory _URIPrefix, bool _URIHasId, string memory _URISuffix) public onlyOwner {
        URIPrefix = _URIPrefix;
        URIHasId = _URIHasId;
        URISuffix = _URISuffix;
    }

    function changeOwner(address newOwner) public onlyOwner {
        transferOwnership(newOwner);
    }

    function changeMaxTokens(uint256 newMaxTokens) public onlyOwner {
        maxTokens = newMaxTokens;
    }

    function changeCost(uint256 newCost) public onlyOwner {
        costPerMint = newCost;
    }

    //------------------------------------//
    //           View Functions           //
    //------------------------------------//
    function seeMaxTokens() public view returns (uint256) {
        return maxTokens;
    }

    function seeTokensInThisContract() public view returns (uint256) {
        return counter;
    }

    function getOriginalCollectionAddress() public view returns (address) {
        return originalContractAddress;
    }

    function readCost() public view returns (uint256) {
        return costPerMint;
    }

    function seeOwner() public view returns (address) {
        return owner();
    }

    function isOwner() public view returns (bool) {
        return (msg.sender == owner());
    }

    //------------------------------------//
    //           Internal Functions       //
    //------------------------------------//
    function _baseURI() internal view virtual override returns (string memory) {
        return URIPrefix;
    }

    // The following functions are overrides required by Solidity.

    function _update(address to, uint256 tokenId, address auth) internal override(ERC721) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Royalty) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (URIHasId) {
            return string.concat(string(abi.encodePacked(_baseURI(), Strings.toString(tokenId))), URISuffix);
        } else {
            return string.concat(_baseURI(), URISuffix);
        }
    }
}
