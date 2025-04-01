const { ethers, network } = require("hardhat");

// Chain IDs
const MOCHA_CHAIN_ID = 10000096;
const LATTE_CHAIN_ID = 10000099;

// Deployed Factory Addresses
const MOCHA_FACTORY = "0xa3b7BDfb5b8392DDAEdDAD05F7e07c0253042B66";
const LATTE_FACTORY = "0x53083e4c228Dad830791a4D41eD4e0b0Ec8B7717";

async function setPeers() {
    // Get the Factory contract factory
    const Factory = await ethers.getContractFactory("Factory");
    
    try {
        const networkName = network.name;
        
        if (networkName === 'espressoOrbit') {
            // Set peer on Mocha chain
            console.log("\nSetting peer on Mocha chain on factory", MOCHA_FACTORY);
            const mochaFactory = Factory.attach(MOCHA_FACTORY);
            const tx = await mochaFactory.setPeerFactory(LATTE_CHAIN_ID, LATTE_FACTORY);
            await tx.wait();
            console.log(`✓ Set Latte Factory (${LATTE_FACTORY}) as peer on Mocha chain`);
            
            // Verify peers
            const peers = await mochaFactory.getPeerChainIds();
            console.log("Mocha chain peers:", peers.map(id => id.toString()));
            
        } else if (networkName === 'latteOrbit') {
            // Set peer on Latte chain
            console.log("\nSetting peer on Latte chain on factory", LATTE_FACTORY);
            const latteFactory = Factory.attach(LATTE_FACTORY);
            const tx = await latteFactory.setPeerFactory(MOCHA_CHAIN_ID, MOCHA_FACTORY);
            await tx.wait();
            console.log(`✓ Set Mocha Factory (${MOCHA_FACTORY}) as peer on Latte chain`);
            
            // Verify peers
            const peers = await latteFactory.getPeerChainIds();
            console.log("Latte chain peers:", peers.map(id => id.toString()));
            
        } else {
            throw new Error(`Unsupported network: ${networkName}`);
        }
        
        console.log("\n✅ Peer relationship set up successfully!");
        
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