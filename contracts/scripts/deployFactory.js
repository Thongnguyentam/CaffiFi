const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  const FEE = ethers.parseUnits("0.01", 18)

  // Deploy Factory
  const Factory = await ethers.getContractFactory("Factory");
  const factory = await Factory.deploy(FEE);

  console.log("✅ Factory deployed at:", await factory.getAddress());

  // Deploy NativeLiquidityPool
  const NativeLiquidityPool = await ethers.getContractFactory("NativeLiquidityPool");
  const liquidityPool = await NativeLiquidityPool.deploy(await factory.getAddress());

  console.log("✅ NativeLiquidityPool deployed at:", await liquidityPool.getAddress());

  // Set liquidity pool in Factory
  const tx = await factory.setLiquidityPool(await liquidityPool.getAddress());
  await tx.wait();
  console.log("✅ Liquidity pool set in Factory");

  // Prepare Launchpad Agent deployment
  const AGENT_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY;
  if (!AGENT_PRIVATE_KEY) {
    throw new Error("❌ AGENT_PRIVATE_KEY not set in .env");
  }
  const agentWallet = new ethers.Wallet(AGENT_PRIVATE_KEY);
  const agentAddress = agentWallet.address

  // Deploy LaunchpadAgent
  const LaunchpadAgent = await ethers.getContractFactory("LaunchpadAgent");
  const agent = await LaunchpadAgent.deploy(await factory.getAddress(), agentAddress);
  console.log("✅ LaunchpadAgent deployed at:", await agent.getAddress());
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
