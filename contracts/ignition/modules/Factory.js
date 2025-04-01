// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { ethers, network } = require("hardhat");

const FEE = ethers.parseUnits("0.001", 18)

// Mocha Chain (chainId: 10000096) Contract Addresses
const MOCHA_INBOX = "0x7dB0d23f4E6e55fbe57229f9F522799AEB6Cc65F"
const MOCHA_BRIDGE = "0x4Caa831C19D6259650fe4C92DDFbC847A129aBCA"
const MOCHA_OUTBOX = "0xE7f14f7911E5b8eBf7b656862dF0E428E6c3aeBc"

// Latte Chain (chainId: 10000099) Contract Addresses
const LATTE_INBOX = "0x6353d578392261dE652b02D13d8079147C729cae"
const LATTE_BRIDGE = "0xC65f739c8b38Bb5Af393d98cc0AC287A3074A316"
const LATTE_OUTBOX = "0x06b600717d8F8399c9E2BC2E5f59F71c078f188a"

// Chain IDs
const CHAIN_A_ID = 10000096; // Mocha chain ID
const CHAIN_B_ID = 10000099; // Latte chain ID

module.exports = buildModule("FactoryModule", (m) => {
    const AGENT_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY || "0c6aaedebed8f32db344a74f5fda724c42a1b7053450ebfecd29ba0e0922dd6b";
    const agentWallet = new ethers.Wallet(AGENT_PRIVATE_KEY);
    const agentAddress = agentWallet.address;

    // Set up the fee for the contract
    const fee = m.getParameter("fee", FEE);

    // Get network name directly from Hardhat
    const networkName = network.name;
    let inbox, bridge, outbox, chainId;

    if (networkName === 'espressoOrbit') {
        console.log(`Deploying to ${networkName} chain...`);
        inbox = MOCHA_INBOX;
        bridge = MOCHA_BRIDGE;
        outbox = MOCHA_OUTBOX;
        chainId = CHAIN_A_ID;
    } else if (networkName === 'latteOrbit') {
        console.log(`Deploying to ${networkName} chain...`);
        inbox = LATTE_INBOX;
        bridge = LATTE_BRIDGE;
        outbox = LATTE_OUTBOX;
        chainId = CHAIN_B_ID;
    } else {
        throw new Error(`Unsupported network: ${networkName}`);
    }

    // Deploy Factory
    console.log(`Deploying Factory for chain ${chainId}...`);
    const factory = m.contract("Factory", [fee, chainId]);

    // Deploy NativeLiquidityPool
    console.log("Deploying NativeLiquidityPool...");
    const liquidityPool = m.contract("NativeLiquidityPool", [factory]);

    // Deploy LaunchpadAgent
    console.log("Deploying LaunchpadAgent...");
    const launchpadAgent = m.contract("LaunchpadAgent", [factory, agentAddress]);

    // Deploy CrossChainMessenger
    console.log("Deploying CrossChainMessenger...");
    const messenger = m.contract("CrossChainMessenger", [
        inbox,
        bridge,
        outbox,
        factory
    ]);

    // Set up relationships
    console.log("Setting up contract relationships...");
    m.call(factory, "setLiquidityPool", [liquidityPool]);
    m.call(factory, "setCrossChainMessenger", [messenger]);

    return {
        factory,
        liquidityPool,
        launchpadAgent,
        messenger
    };
});
