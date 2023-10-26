// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";

contract GmFam is ERC721,ERC721Burnable, ERC721Royalty,Ownable {
    error GmFam__YouAreNotTheOwner();
    error GmFam__YouMUSTPayForMint(uint, uint);
    error GmFam__TransferFailed();
    error GmFam__NotEnoughFunds();
    error GmFam__MaxSupplyReached();

    address oldContract;
    uint public costPerMint;
    string URIPrefix;
    bool URIHasId;
    string URISuffix;
    uint256 public maxTokens;
    uint256 public counter;
    constructor(
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
    ) ERC721(nameOfToken,symbolOfToken) Ownable(initialOwner) {
        oldContract = _oldContract;
        URIPrefix = _URIPrefix;
        URIHasId = _URIHasId;
        URISuffix = _URISuffix;
        maxTokens = _maxTokens;
        /// @dev Sets the cost per mint
        uint priceInEth = _costPerMint;
        costPerMint = priceInEth;
        /// @dev Sets the royalty fee for the contract
        ///      feeNumerator is in basis points (1/100 of a percent)
        ///      10000 = 100%
        ///      250 = 2.5%
        _setDefaultRoyalty(address(this), feeNumerator);
    }

    function seeMaxTokens() public view returns (uint256) {
        return maxTokens;
    }
    function transferFunds(address payable to, uint amount) public onlyOwner {
        if(address(this).balance < amount) {
            revert GmFam__NotEnoughFunds();
        }
        if (payable(to).send(amount)) {
            revert GmFam__TransferFailed();
        }
    }

    function safeMint(uint256 tokenId) public payable{
        if (counter >= maxTokens) {
            revert GmFam__MaxSupplyReached();
        }
        if (msg.value < costPerMint) {
            revert GmFam__YouMUSTPayForMint(msg.value, costPerMint);
        }
        if (msg.sender != ERC721(oldContract).ownerOf(tokenId)) {
            revert GmFam__YouAreNotTheOwner();
        }
        
        if (payable(address(this)).send(msg.value)) {
            revert GmFam__TransferFailed();
        }
        ERC721(oldContract).transferFrom(msg.sender, address(this), tokenId);
        _safeMint(msg.sender, tokenId);
        counter++;
    }

    function byeBye(uint256 tokenId) public {
        if (msg.sender != ownerOf(tokenId)) {
            revert GmFam__YouAreNotTheOwner();
        }
        ERC721(oldContract).safeTransferFrom(address(this), msg.sender, tokenId);
        /// @dev This is the burn function from ERC721Burnable
        _burn(tokenId); 
        counter--;
    }

    

    function _baseURI() internal view virtual override returns (string memory) {
        return URIPrefix;
    }

    function changeBaseURI(
        string memory _URIPrefix,
        bool _URIHasId,
        string memory _URISuffix
    ) public onlyOwner {
        URIPrefix = _URIPrefix;
        URIHasId = _URIHasId;
        URISuffix = _URISuffix;
    }

    function changeCost(uint newCost) public onlyOwner {
        costPerMint = newCost;
    }
    
    function readCost() public view returns (uint) {
        return costPerMint;
    }
    // The following functions are overrides required by Solidity.

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721,ERC721Royalty)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {   
        if (URIHasId) {
            return string.concat(string(abi.encodePacked(_baseURI() , Strings.toString(tokenId))), URISuffix);
        } else {
            return string.concat(_baseURI(), URISuffix);
        }
    }
}
