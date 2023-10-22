// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
   
@jistr0

SC functions (asume que el user ya le dio grant al SC nuevo sobre el NFT a jalar/pull)

------------------
config general contrato MVP: a. tendra creator fees
 (Done) b. tendra como baseURI la misma que la del contrato original (la saca por el fron para el mvp) c. source contract address modifcar 
 (done)f. Cost per mint (external payable) agregar, este costo indica el costo para crear un nuevo token en el nuevo contrato, el costo es en ETH y se le envia al owner del contrato.
------------------
mint done 
 (done)1. se jala el tokenId del SC remoto (recibe como parametros el SCaddress y tokenId), se supone que ya tiene grantee access. 
 (done)2. mintea en el contrato nuevo (este) el tokenId (igual al que recibe) para el user nuevo.
-------------------
contractOwner done
 (done)1. Es definido al momento de crearse (no es necesariamente el mismo que lo deploya) y puede ser un SAFE.
-------------------
(done)transferFunds 1. Envia el ETH pedido al wallet que se le pase, contractOwnerrestricted.

--------------------
RESTO DE FUNCIONES
 transfer y todas las funciones normales de un ERC-721, pero sin permisos especiales para el owner, asi es permissionless y trustless.
-------------------   */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GmFam is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Burnable, Ownable {
    error YouAreNotTheOwner();
    error YouMUSTPayForMint();

    address oldContract;
    string public baseURI;
    uint public costPerMint;

    constructor(
        address initialOwner, 
    address _oldContract, 
    string memory nameOfToken, 
    string memory symbolOfToken,
    string memory _baseURI,
    uint256 _costPerMint
    ) ERC721(nameOfToken,symbolOfToken) Ownable(initialOwner) {
        oldContract = _oldContract;
        baseURI = _baseURI;
        costPerMint = _costPerMint;
    }


    function transferFunds(address payable who) public onlyOwner {
        who.transfer(address(this).balance);
    }

    function safeMint(uint256 tokenId) public payable {
        if ( msg.value != costPerMint) {
            revert YouMUSTPayForMint();
        }
        if (msg.sender != ERC721(oldContract).ownerOf(tokenId)) {
            revert YouAreNotTheOwner();
        }
        payable(address(this)).transfer(msg.value);
        
        ERC721(oldContract).transferFrom(msg.sender, address(this), tokenId);
        address auxAddress = msg.sender;
        _safeMint(auxAddress, tokenId);
        _setTokenURI(tokenId, baseURI);
    }

    function byeBye(uint256 tokenId) public {
        if (msg.sender != ownerOf(tokenId)) {
            revert YouAreNotTheOwner();
        }
        ERC721(oldContract).safeTransferFrom(address(this), msg.sender, tokenId);
        // cambiamos el mapping del token actual a null
        _burn(tokenId); 
    }

    function changeBaseURI(string memory _baseURI) public onlyOwner {
        baseURI = _baseURI;
    }

    function changeCost(uint newCost) public onlyOwner {
        costPerMint = newCost;
    }

    // The following functions are overrides required by Solidity.

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
