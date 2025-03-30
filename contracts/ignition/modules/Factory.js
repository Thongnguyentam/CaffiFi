// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition
// create  deployment script
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { ethers } = require("hardhat");

const FEE = ethers.parseUnits("0.01", 18)
const LZ_ENDPOINT = "0x6C7Ab2202C98C4227C5c46f1417D81144DA716Ff" // Sonic EndpointV2
// const LZ_ENDPOINT = "0x6EDCE65403992e310A62460808c4b910D972f10f" // Arbitrum Sepolia Testnet

module.exports = buildModule("FactoryModule", (m) => {
    // Get the agent wallet from private key
    const AGENT_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY;
    if (!AGENT_PRIVATE_KEY) {
        throw new Error("AGENT_PRIVATE_KEY not set in environment variables");
    }

    // Create agent wallet instance
    const agentWallet = new ethers.Wallet(AGENT_PRIVATE_KEY);
    const agentAddress = agentWallet.address;

    // set up the fee for the contract
    const fee = m.getParameter("fee", FEE);
    const lzEndpoint = m.getParameter("lzEndpoint", LZ_ENDPOINT);
    
    // Deploy Factory contract first
    const factory = m.contract("Factory", [fee, lzEndpoint]);

    // Deploy Native Liquidity Pool Contract
    const liquidityPool = m.contract("NativeLiquidityPool", [factory]);

    // Set Liquidity Pool in Factory contract
    m.call(factory, "setLiquidityPool", [liquidityPool]);

    // Deploy LaunchpadAgent with Factory address and agent address
    const launchpadAgent = m.contract("LaunchpadAgent", [factory, agentAddress]);

    // return all contracts
    return { factory, liquidityPool, launchpadAgent };
});
