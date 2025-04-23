// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Bank {
    ERC20 public token;
    address public owner;
    
    struct User {
        string username;
        string email;
        bool exists;
        uint256 createdAt;
    }
    
    mapping(address => User) public users;
    address[] public userAddresses;
    mapping(string => address) public usernameToAddress;
    
    event UserCreated(address indexed userAddress, string username, uint256 timestamp);
    event TokensDeposited(address indexed to, uint256 amount, uint256 timestamp);
    event TokensWithdrawn(address indexed from, uint256 amount, uint256 timestamp);
    event UsernameChanged(address indexed userAddress, string oldUsername, string newUsername, uint256 timestamp);
    event EmailChanged(address indexed userAddress, string newEmail, uint256 timestamp);
    
    constructor(address tokenAddress) {
        token = ERC20(tokenAddress);
        owner = msg.sender;
    }
    
    function createUser(address userAddress, string memory username, string memory email) public {
        require(msg.sender == owner, "Only bank can create users");
        require(!users[userAddress].exists, "User address already exists");
        require(usernameToAddress[username] == address(0), "Username already taken");
        
        users[userAddress] = User({
            username: username,
            email: email,
            exists: true,
            createdAt: block.timestamp
        });
        
        userAddresses.push(userAddress);
        usernameToAddress[username] = userAddress;
        
        emit UserCreated(userAddress, username, block.timestamp);
    }
    
    function getUserCount() public view returns (uint256) {
        return userAddresses.length;
    }
    
    function deposit(address user, uint256 amount) public {
        require(msg.sender == owner, "Only bank");
        require(users[user].exists, "User does not exist");
        require(token.transfer(user, amount), "Transfer failed");
        
        emit TokensDeposited(user, amount, block.timestamp);
    }
    
    function withdraw(uint256 amount) public {
        require(users[msg.sender].exists, "User does not exist");
        require(token.transferFrom(msg.sender, owner, amount), "Transfer failed");
        
        emit TokensWithdrawn(msg.sender, amount, block.timestamp);
    }
    
    function changeUsername(address userAddress, string memory newUsername) public {
        // Check if caller is authorized (either bank owner or the user themselves)
        require(msg.sender == owner || msg.sender == userAddress, "Not authorized");
        require(users[userAddress].exists, "User does not exist");
        require(usernameToAddress[newUsername] == address(0), "Username already taken");
        
        string memory oldUsername = users[userAddress].username;
        
        // Update the usernameToAddress mapping
        delete usernameToAddress[oldUsername];
        usernameToAddress[newUsername] = userAddress;
        
        // Update the user struct
        users[userAddress].username = newUsername;
        
        emit UsernameChanged(userAddress, oldUsername, newUsername, block.timestamp);
    }
    
    function changeEmail(address userAddress, string memory newEmail) public {
        // Check if caller is authorized (either bank owner or the user themselves)
        require(msg.sender == owner || msg.sender == userAddress, "Not authorized");
        require(users[userAddress].exists, "User does not exist");
        
        // Update the user struct
        users[userAddress].email = newEmail;
        
        emit EmailChanged(userAddress, newEmail, block.timestamp);
    }
}