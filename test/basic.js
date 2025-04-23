// Enhanced test script for Bank & BankToken contracts
import Web3 from 'web3';
import { createRequire } from 'module';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
const require = createRequire(import.meta.url);

// Import contract ABIs
const BankABI = require('../artifacts/contracts/Bank.sol/Bank.json').abi;
const BankTokenABI = require('../artifacts/contracts/BankToken.sol/BankToken.json').abi;

// Define test scenarios
const TEST_SCENARIOS = {
  USER_MANAGEMENT: true,    // Test user creation and profile management
  TOKEN_OPERATIONS: true,   // Test deposits, withdrawals, transfers
  PROFILE_UPDATES: true     // Test username and email updates
};

async function runTest() {
  console.log("Starting enhanced test suite...");

  // Initialize web3 with EIP-1559 disabled
  const web3 = new Web3(process.env.RPC_URL, {
    transactionType: '0x0', // Force legacy transactions
  });

  const bankOwnerAddress = process.env.BANK_OWNER_ADDRESS;
  const bankAddress = process.env.BANK_ADDRESS;
  const tokenAddress = process.env.TOKEN_ADDRESS;
  const defaultGas = parseInt(process.env.DEFAULT_GAS || '300000');

  console.log("Bank Owner:", bankOwnerAddress);
  console.log("Bank Contract:", bankAddress);
  console.log("Token Contract:", tokenAddress);

  // Initialize contract instances
  const bank = new web3.eth.Contract(BankABI, bankAddress);
  const token = new web3.eth.Contract(BankTokenABI, tokenAddress);

  // Test accounts
  let userA = null;
  let userB = null;
  let userC = null;

  // Helper function to get token balance
  async function getTokenBalance(address) {
    try {
      const balance = await token.methods.balanceOf(address).call();
      console.log(`Balance for ${address}: ${web3.utils.fromWei(balance, 'ether')} BNK`);
      return balance;
    } catch (error) {
      console.error(`Failed to get balance for ${address}:`, error.message);
      return '0';
    }
  }

  // Helper function to create a test user
  async function createTestUser(username, email = '') {
    // Create and fund a new account
    const account = web3.eth.accounts.create();
    web3.eth.accounts.wallet.add(account.privateKey);
    
    // Fund with ETH for gas
    await web3.eth.sendTransaction({
      from: bankOwnerAddress,
      to: account.address,
      value: web3.utils.toWei('0.5', 'ether'),
      gas: 21000,
      type: '0x0'
    });
    
    // Register user on blockchain
    await bank.methods.createUser(account.address, username, email)
      .send({
        from: bankOwnerAddress,
        gas: defaultGas,
        type: '0x0'
      });
    
    console.log(`Created user '${username}' with address ${account.address}`);
    return account;
  }

  try {
    // ===== CONTRACT VERIFICATION =====
    console.log("\n--- VERIFYING CONTRACTS ---");
    try {
      const tokenName = await token.methods.name().call();
      const tokenSymbol = await token.methods.symbol().call();
      const tokenDecimals = await token.methods.decimals().call();
      const totalSupply = await token.methods.totalSupply().call();

      console.log(`Token: ${tokenName} (${tokenSymbol})`);
      console.log(`Decimals: ${tokenDecimals}`);
      console.log(`Total Supply: ${web3.utils.fromWei(totalSupply, 'ether')} ${tokenSymbol}`);
      
      const owner = await bank.methods.owner().call();
      console.log(`Bank contract owner: ${owner}`);
      
      if (owner.toLowerCase() !== bankOwnerAddress.toLowerCase()) {
        console.warn("WARNING: Transaction sender is not the contract owner!");
      }
    } catch (error) {
      console.error("Error verifying contracts:", error.message);
      throw new Error("Contract verification failed - cannot proceed");
    }

    // ==== USER MANAGEMENT TESTS =====
    if (TEST_SCENARIOS.USER_MANAGEMENT) {
      console.log("\n--- USER MANAGEMENT TESTS ---");
      
      // Create test users
      userA = await createTestUser("alice", "alice@example.com");
      userB = await createTestUser("bob", "bob@example.com");
      
      // Verify user count
      const userCount = await bank.methods.getUserCount().call();
      console.log(`Total users in system: ${userCount}`);
      
      // Verify user details for userA
      const userAData = await bank.methods.users(userA.address).call();
      console.log(`\nUser A details:`);
      console.log(`Username: ${userAData.username}`);
      console.log(`Email: ${userAData.email}`);
      console.log(`Exists: ${userAData.exists}`);
      console.log(`Created at: ${new Date(Number(userAData.createdAt) * 1000).toLocaleString()}`);
      
      // Verify username lookup
      const aliceAddress = await bank.methods.usernameToAddress("alice").call();
      console.log(`\nLooking up 'alice' returns address: ${aliceAddress}`);
      if (aliceAddress.toLowerCase() !== userA.address.toLowerCase()) {
        console.error("ERROR: Username lookup failed!");
      }
    }
    
    // ===== PREPARE FOR TOKEN OPERATIONS =====
    console.log("\n--- PREPARING FOR TOKEN OPERATIONS ---");
    
    // Check bank owner token balance
    console.log("Bank owner token balance:");
    const ownerBalance = await getTokenBalance(bankOwnerAddress);
    
    if (web3.utils.toBigInt(ownerBalance) < web3.utils.toBigInt(web3.utils.toWei('150', 'ether'))) {
      console.warn("WARNING: Bank owner may not have enough tokens for tests");
    }
    
    // Fund bank contract with tokens
    console.log("\nFunding Bank contract with tokens...");
    try {
      await token.methods.transfer(bankAddress, web3.utils.toWei('1000', 'ether'))
        .send({
          from: bankOwnerAddress,
          gas: defaultGas,
          type: '0x0'
        });
        
      const bankBalance = await token.methods.balanceOf(bankAddress).call();
      console.log(`Bank contract balance: ${web3.utils.fromWei(bankBalance, 'ether')} BNK`);
    } catch (error) {
      console.error("Failed to fund Bank contract:", error.message);
      throw new Error("Cannot proceed without funding bank contract");
    }
    
    // ===== TOKEN OPERATIONS TESTS =====
    if (TEST_SCENARIOS.TOKEN_OPERATIONS) {
      console.log("\n--- TOKEN OPERATIONS TESTS ---");
      
      // Test deposits
      console.log("\nTesting deposits:");
      try {
        console.log("Depositing 100 tokens to Alice...");
        await bank.methods.deposit(userA.address, web3.utils.toWei('100', 'ether'))
          .send({
            from: bankOwnerAddress,
            gas: defaultGas,
            type: '0x0'
          });
        console.log("Deposit to Alice successful");
          
        console.log("Depositing 50 tokens to Bob...");
        await bank.methods.deposit(userB.address, web3.utils.toWei('50', 'ether'))
          .send({
            from: bankOwnerAddress,
            gas: defaultGas,
            type: '0x0'
          });
        console.log("Deposit to Bob successful");
      } catch (error) {
        console.error("Failed during deposits:", error.message);
        throw new Error("Deposit tests failed");
      }
      
      console.log("\nBalances after deposits:");
      await getTokenBalance(userA.address);
      await getTokenBalance(userB.address);
      
      // Test user-to-user transfers
      console.log("\nTesting user-to-user transfers:");
      try {
        console.log("Alice sending 30 tokens to Bob...");
        await token.methods.transfer(userB.address, web3.utils.toWei('30', 'ether'))
          .send({
            from: userA.address,
            gas: defaultGas,
            type: '0x0'
          });
        console.log("Transfer successful");
      } catch (error) {
        console.error("Failed during transfer:", error.message);
        throw new Error("Transfer test failed");
      }
      
      console.log("\nBalances after transfer:");
      await getTokenBalance(userA.address);
      await getTokenBalance(userB.address);
      
      // Test withdrawals
      console.log("\nTesting withdrawal:");
      try {
        console.log("Bob approving Bank contract to spend 25 tokens...");
        await token.methods.approve(bankAddress, web3.utils.toWei('25', 'ether'))
          .send({
            from: userB.address,
            gas: defaultGas,
            type: '0x0'
          });
        console.log("Approval successful");
        
        console.log("Bob withdrawing 25 tokens...");
        await bank.methods.withdraw(web3.utils.toWei('25', 'ether'))
          .send({
            from: userB.address,
            gas: defaultGas,
            type: '0x0'
          });
        console.log("Withdrawal successful");
      } catch (error) {
        console.error("Failed during withdrawal:", error.message);
        throw new Error("Withdrawal test failed");
      }
      
      console.log("\nBalances after withdrawal:");
      await getTokenBalance(userB.address);
      await getTokenBalance(bankOwnerAddress);
    }
    
    // ===== PROFILE UPDATE TESTS =====
    if (TEST_SCENARIOS.PROFILE_UPDATES) {
      console.log("\n--- PROFILE UPDATE TESTS ---");
      
      // Create a third user for these tests
      userC = await createTestUser("charlie", "charlie@example.com");
      
      // Test changing username
      console.log("\nTesting username change:");
      try {
        const oldUsername = "charlie";
        const newUsername = "charles";
        
        console.log(`Changing username from '${oldUsername}' to '${newUsername}'...`);
        await bank.methods.changeUsername(userC.address, newUsername)
          .send({
            from: userC.address,
            gas: defaultGas,
            type: '0x0'
          });
        console.log("Username change successful");
        
        // Verify the change
        const userCData = await bank.methods.users(userC.address).call();
        console.log(`New username in user record: ${userCData.username}`);
        
        // Verify username lookup
        const charlesAddress = await bank.methods.usernameToAddress(newUsername).call();
        console.log(`Looking up '${newUsername}' returns: ${charlesAddress}`);
        
        // Old username should return zero address
        const oldUsernameAddress = await bank.methods.usernameToAddress(oldUsername).call();
        console.log(`Looking up old username '${oldUsername}' returns: ${oldUsernameAddress}`);
        if (oldUsernameAddress !== '0x0000000000000000000000000000000000000000') {
          console.error("ERROR: Old username mapping was not cleared correctly");
        }
      } catch (error) {
        console.error("Failed during username change:", error.message);
        throw new Error("Username change test failed");
      }
      
      // Test changing email
      console.log("\nTesting email change:");
      try {
        const newEmail = "charles@corporate.com";
        
        console.log(`Changing email to '${newEmail}'...`);
        await bank.methods.changeEmail(userC.address, newEmail)
          .send({
            from: userC.address,
            gas: defaultGas,
            type: '0x0'
          });
        console.log("Email change successful");
        
        // Verify the change
        const userCData = await bank.methods.users(userC.address).call();
        console.log(`New email in user record: ${userCData.email}`);
      } catch (error) {
        console.error("Failed during email change:", error.message);
        throw new Error("Email change test failed");
      }
      
      // Test bank owner changing a user's profile
      console.log("\nTesting admin profile management:");
      try {
        console.log("Bank owner changing Alice's email...");
        await bank.methods.changeEmail(userA.address, "alice.new@example.com")
          .send({
            from: bankOwnerAddress,
            gas: defaultGas,
            type: '0x0'
          });
        console.log("Email change by admin successful");
        
        // Verify the change
        const userAData = await bank.methods.users(userA.address).call();
        console.log(`Alice's new email: ${userAData.email}`);
      } catch (error) {
        console.error("Failed during admin profile management:", error.message);
        throw new Error("Admin profile management test failed");
      }
    }
    
    console.log("\n--- TEST SUITE COMPLETE ---");
    console.log("All tests passed successfully!");
    
  } catch (error) {
    console.error("\nTEST SUITE FAILED:", error.message);
  }
}

// Run the test
console.log("Enhanced Blockchain Testing Script");
console.log("=================================");
runTest().catch(error => {
  console.error("Fatal error:", error);
});