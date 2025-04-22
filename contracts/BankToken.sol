// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BankToken is ERC20 {
    address public owner;
    
    constructor(uint256 initialSupply) ERC20("Bank Token", "BNK") {
        owner = msg.sender;
        _mint(msg.sender, initialSupply);
    }
}
