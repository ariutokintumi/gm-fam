// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DigitalCherry is ERC721, Ownable {
    uint256 private _nextTokenId;
    error MaxiumSupplyReached();
    constructor(address initialOwner)
        ERC721("Digital Cherry", "CHRY")
        Ownable(initialOwner)
    {}

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmWx3cFwFGAxd43AutywbqykKFDcvuvo8zG75Z7rKbzTPr/";
    }

    function safeMint(address to) public {
        uint256 tokenId = _nextTokenId++;
        if (tokenId >= 100) revert MaxiumSupplyReached();
        _safeMint(to, tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        pure
        override
        returns (string memory)
    {
        //concatenamos el baseURI con el tokenId y .json
        return string.concat(string(abi.encodePacked(_baseURI(), Strings.toString(tokenId))), ".json");
    }
}