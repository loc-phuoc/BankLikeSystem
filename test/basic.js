// Setup: assume bankOwnerAddress is known and unlocked
import Web3 from 'web3';
import { createRequire } from 'module';
require('dotenv').config();
const require = createRequire(import.meta.url);

// Import your contract ABIs
const BankABI = require('../artifacts/contracts/Bank.sol/Bank.json').abi;
const BankTokenABI = require('../artifacts/contracts/BankToken.sol/BankToken.json').abi;

// Create a main async function to run the test
async function runTest() {
    console.log("Starting test...");

    // Initialize web3 with EIP-1559 disabled
    const web3 = new Web3(process.env.RPC_URL, {
        transactionType: '0x0', // Force legacy transactions
    });

    const bankOwnerAddress = process.env.BANK_OWNER_ADDRESS || '0xYourBankOwnerAddress'; // Replace with your bank owner address
    const bankAddress = process.env.BANK_ADDRESS || '0xYourBankAddress'; // Replace with your bank contract address
    const tokenAddress = process.env.TOKEN_ADDRESS || '0xYourTokenAddress'; // Replace with your token contract address

    console.log("Bank Owner:", bankOwnerAddress);
    console.log("Bank Contract:", bankAddress);
    console.log("Token Contract:", tokenAddress);

    // Initialize contract instances
    const bank = new web3.eth.Contract(BankABI, bankAddress);
    const token = new web3.eth.Contract(BankTokenABI, tokenAddress);

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

    try {
        // Verify contract status
        console.log("\n--- VERIFYING CONTRACTS ---");
        try {
            const tokenName = await token.methods.name().call();
            const tokenSymbol = await token.methods.symbol().call();
            const tokenDecimals = await token.methods.decimals().call();
            const totalSupply = await token.methods.totalSupply().call();

            console.log(`Token: ${tokenName} (${tokenSymbol})`);
            console.log(`Decimals: ${tokenDecimals}`);
            console.log(`Total Supply: ${web3.utils.fromWei(totalSupply, 'ether')} ${tokenSymbol}`);
        } catch (error) {
            console.error("Error verifying token contract:", error.message);
            throw new Error("Token contract verification failed - cannot proceed");
        }

        // Check if bank contract has owner function
        try {
            const owner = await bank.methods.owner().call();
            console.log(`Bank contract owner: ${owner}`);
            if (owner.toLowerCase() !== bankOwnerAddress.toLowerCase()) {
                console.warn("WARNING: Transaction sender is not the contract owner!");
            }
        } catch (error) {
            console.log("Bank contract doesn't have an owner() function or couldn't be accessed");
        }

        // Check bank owner token balance
        console.log("\n--- CHECKING BALANCES ---");
        console.log("Bank owner token balance:");
        const ownerBalance = await getTokenBalance(bankOwnerAddress);

        if (web3.utils.toBigInt(ownerBalance) < web3.utils.toBigInt(web3.utils.toWei('150', 'ether'))) {
            console.warn("WARNING: Bank owner may not have enough tokens for the test deposits");
        }

        // Check if bank contract already has an allowance
        try {
            const allowance = await token.methods.allowance(bankOwnerAddress, bankAddress).call();
            console.log(`Current allowance from bank owner to bank contract: ${web3.utils.fromWei(allowance, 'ether')} BNK`);

            // If allowance is too low, increase it
            if (web3.utils.toBigInt(allowance) < web3.utils.toBigInt(web3.utils.toWei('150', 'ether'))) {
                console.log("Approving bank contract to spend tokens...");
                await token.methods.approve(
                    bankAddress,
                    web3.utils.toWei('1000000', 'ether')
                ).send({
                    from: bankOwnerAddress,
                    gas: 200000,
                    type: '0x0'
                });
                console.log("Approval successful");
            }
        } catch (error) {
            console.error("Error checking/setting allowance:", error.message);
        }

        // 1. Create UserA and UserB accounts
        console.log("\n--- CREATING TEST ACCOUNTS ---");
        const userA = web3.eth.accounts.create();
        const userB = web3.eth.accounts.create();
        console.log("UserA:", userA.address);
        console.log("UserB:", userB.address);

        // Add accounts to wallet for signing
        web3.eth.accounts.wallet.add(userA.privateKey);
        web3.eth.accounts.wallet.add(userB.privateKey);

        // Fund user accounts with Ether for gas
        console.log("\n--- FUNDING TEST ACCOUNTS WITH ETH ---");
        try {
            await web3.eth.sendTransaction({
                from: bankOwnerAddress,
                to: userA.address,
                value: web3.utils.toWei('0.5', 'ether'),
                gas: 21000,
                type: '0x0'
            });
            console.log(`Funded UserA with 0.5 ETH`);
        } catch (error) {
            console.error("Failed to fund UserA:", error.message);
            throw new Error("Cannot proceed without funding accounts");
        }

        try {
            await web3.eth.sendTransaction({
                from: bankOwnerAddress,
                to: userB.address,
                value: web3.utils.toWei('0.5', 'ether'),
                gas: 21000,
                type: '0x0'
            });
            console.log(`Funded UserB with 0.5 ETH`);
        } catch (error) {
            console.error("Failed to fund UserB:", error.message);
            throw new Error("Cannot proceed without funding accounts");
        }

        // Add this before your deposit calls
        console.log("\n--- FUNDING BANK CONTRACT WITH TOKENS ---");
        try {
            console.log("Transferring 1000 tokens to Bank contract...");
            await token.methods.transfer(bankAddress, web3.utils.toWei('1000', 'ether'))
                .send({
                    from: bankOwnerAddress,
                    gas: 200000,
                    type: '0x0'
                });

            // Verify bank balance
            const bankBalance = await token.methods.balanceOf(bankAddress).call();
            console.log(`Bank contract balance: ${web3.utils.fromWei(bankBalance, 'ether')} BNK`);
        } catch (error) {
            console.error("Failed to fund Bank contract:", error.message);
            throw new Error("Cannot proceed with test");
        }

        // 2. Bank deposits currency to users
        console.log("\n--- DEPOSITING TOKENS TO USERS ---");

        // Check deposit function interface
        try {
            console.log("Attempting to understand deposit function...");
            const depositFunction = bank.methods.deposit;
            if (!depositFunction) {
                throw new Error("Bank contract doesn't have a deposit function");
            }
        } catch (error) {
            console.error("Error with deposit function:", error.message);
            throw new Error("Cannot proceed with deposits");
        }

        try {
            console.log("Depositing 100 tokens to UserA...");
            await bank.methods.deposit(userA.address, web3.utils.toWei('100', 'ether'))
                .send({
                    from: bankOwnerAddress,
                    gas: 300000,
                    type: '0x0'
                });
            console.log("Deposit to UserA successful");
        } catch (error) {
            console.error("Failed to deposit to UserA:", error.message);

            // Try to call the method to get a more specific error
            try {
                await bank.methods.deposit(userA.address, web3.utils.toWei('100', 'ether')).call({ from: bankOwnerAddress });
            } catch (callError) {
                console.error("Call error details:", callError.message);
            }

            throw new Error("Cannot proceed with test after deposit failure");
        }

        try {
            console.log("Depositing 50 tokens to UserB...");
            await bank.methods.deposit(userB.address, web3.utils.toWei('50', 'ether'))
                .send({
                    from: bankOwnerAddress,
                    gas: 300000,
                    type: '0x0'
                });
            console.log("Deposit to UserB successful");
        } catch (error) {
            console.error("Failed to deposit to UserB:", error.message);
            throw new Error("Cannot proceed with test after deposit failure");
        }

        console.log("\nAfter deposit:");
        await getTokenBalance(userA.address);
        await getTokenBalance(userB.address);

        // 3. Users trade: UserA buys an artifact from UserB for 30 tokens
        console.log("\n--- USER-TO-USER TRANSFER ---");
        console.log("UserA buying an artifact from UserB for 30 tokens...");
        try {
            await token.methods.transfer(userB.address, web3.utils.toWei('30', 'ether'))
                .send({
                    from: userA.address,
                    gas: 200000,
                    type: '0x0'
                });
            console.log("Transfer successful");
        } catch (error) {
            console.error("Failed to transfer tokens from UserA to UserB:", error.message);
            throw new Error("Cannot proceed with test after transfer failure");
        }

        console.log("\nAfter trade:");
        await getTokenBalance(userA.address);
        await getTokenBalance(userB.address);

        // 4. UserB withdraws 30 tokens
        console.log("\n--- TOKEN WITHDRAWAL ---");
        try {
            console.log("UserB approving Bank contract to spend 30 tokens...");
            await token.methods.approve(bankAddress, web3.utils.toWei('30', 'ether'))
                .send({
                    from: userB.address,
                    gas: 200000,
                    type: '0x0'
                });
            console.log("Approval successful");
        } catch (error) {
            console.error("Failed to approve token spending:", error.message);
            throw new Error("Cannot proceed with test after approval failure");
        }

        try {
            console.log("UserB withdrawing 30 tokens...");
            await bank.methods.withdraw(web3.utils.toWei('30', 'ether'))
                .send({
                    from: userB.address,
                    gas: 300000,
                    type: '0x0'
                });
            console.log("Withdrawal successful");
        } catch (error) {
            console.error("Failed to withdraw tokens:", error.message);

            // Try to call the method to get a more specific error
            try {
                await bank.methods.withdraw(web3.utils.toWei('30', 'ether')).call({ from: userB.address });
            } catch (callError) {
                console.error("Call error details:", callError.message);
            }
        }

        console.log("\nAfter withdrawal by UserB:");
        await getTokenBalance(userB.address);
        await getTokenBalance(bankOwnerAddress);

        console.log("\n--- TEST COMPLETE ---");
    } catch (error) {
        console.error("\nTEST FAILED:", error.message);
    }
}

// Run the test
console.log("Blockchain Testing Script");
console.log("======================");
runTest().catch(error => {
    console.error("Fatal error:", error);
});