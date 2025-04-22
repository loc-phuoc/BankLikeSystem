// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Bank {
    ERC20 public token;
    address public owner;

    constructor(address tokenAddress) {
        token = ERC20(tokenAddress);
        owner = msg.sender;
    }

    function deposit(address user, uint256 amount) public {
        require(msg.sender == owner, "Only bank");
        require(token.transfer(user, amount), "Transfer failed");
    }

    function withdraw(uint256 amount) public {
        require(token.transferFrom(msg.sender, owner, amount), "Transfer failed");
    }
}
