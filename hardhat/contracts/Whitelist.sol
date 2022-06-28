//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

contract Whitelist {
    uint8 public maxWhitelistedAddresses;
    mapping(address => bool) public whitelistedAddresses;

    uint8 public numAddressesWhitelisted;

    constructor(uint8 _maxWhitelistedAddresses) {
        maxWhitelistedAddresses = _maxWhitelistedAddresses;
    }

    function addAddressToWhitelist() public {
        require(!whitelistedAddresses[msg.sender], "Sender is already on whitelist");
        require(numAddressesWhitelisted < maxWhitelistedAddresses, "Max number of addresses added");

        whitelistedAddresses[msg.sender] = true;

        numAddressesWhitelisted += 1;
    }
}