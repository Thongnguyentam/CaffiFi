const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

// Chain IDs
const MOCHA_CHAIN_ID = 10000096;
const LATTE_CHAIN_ID = 10000099;

async function readDeploymentAddresses() {
    try {
        const readmePath = path.join(__dirname, '..', '..', 'README.md');
        const content = fs.readFileSync(readmePath, 'utf8');
        
        // Extract addresses using regex
        const mochaFactoryMatch = content.match(/Mocha Factory:\s+`(0x[a-fA-F0-9]{40})`/);
        const latteFactoryMatch = content.match(/Latte Factory:\s+`(0x[a-fA-F0-9]{40})`/);
        
        if (!mochaFactoryMatch || !latteFactoryMatch) {
            throw new Error("Could not find factory addresses in README.md");
        }

        return {
            mochaFactory: mochaFactoryMatch[1],
            latteFactory: latteFactoryMatch[1]
        };
    } catch (error) {
        console.error("Error reading deployment addresses:", error);
        process.exit(1);
    }
}

async function setPeers() {
    // Get deployed addresses
    const addresses = await readDeploymentAddresses();
    
    // Get the Factory contract factory
    const Factory = await ethers.getContractFactory("Factory");
    
    try {
        // Set peers on Mocha chain
        console.log("\nSetting peer on Mocha chain...");
        await hre.changeNetwork("espressoOrbit");
        const mochaFactory = Factory.attach(addresses.mochaFactory);
        const tx1 = await mochaFactory.setPeerFactory(LATTE_CHAIN_ID, addresses.latteFactory);
        await tx1.wait();
        console.log(`✓ Set Latte Factory (${addresses.latteFactory}) as peer on Mocha chain`);
        
        // Set peers on Latte chain
        console.log("\nSetting peer on Latte chain...");
        await hre.changeNetwork("latteOrbit");
        const latteFactory = Factory.attach(addresses.latteFactory);
        const tx2 = await latteFactory.setPeerFactory(MOCHA_CHAIN_ID, addresses.mochaFactory);
        await tx2.wait();
        console.log(`✓ Set Mocha Factory (${addresses.mochaFactory}) as peer on Latte chain`);
        
        // Verify peers
        console.log("\nVerifying peer relationships...");
        
        await hre.changeNetwork("espressoOrbit");
        const mochaPeers = await mochaFactory.getPeerChainIds();
        console.log("Mocha chain peers:", mochaPeers.map(id => id.toString()));
        
        await hre.changeNetwork("latteOrbit");
        const lattePeers = await latteFactory.getPeerChainIds();
        console.log("Latte chain peers:", lattePeers.map(id => id.toString()));
        
        console.log("\n✅ Peer relationships set up successfully!");
        
    } catch (error) {
        console.error("Error setting up peers:", error);
        process.exit(1);
    }
}

// Execute if running directly
if (require.main === module) {
    setPeers()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = setPeers; 