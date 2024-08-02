// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMusic is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;

    struct MusicMetadata {
        string title;
        string artist;
        string album;
        string agreement;
    }

    mapping(uint256 => MusicMetadata) public tokenIdToMetadata;

    constructor() ERC721("NFTMusic", "NFTM") {
        tokenCounter = 0;
    }

    function createNFT(string memory tokenURI, string memory title, string memory artist, string memory album, string memory agreement) public onlyOwner returns (uint256) {
        uint256 newItemId = tokenCounter;
        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        MusicMetadata memory metadata = MusicMetadata({
            title: title,
            artist: artist,
            album: album,
            agreement: agreement
        });

        tokenIdToMetadata[newItemId] = metadata;
        tokenCounter++;
        return newItemId;
    }
}
