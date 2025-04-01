const hre = require("hardhat");

async function main() {
  // Deploy L2 contracts first
  console.log("Deploying L2CrossChainMessenger...");
  const L2CrossChainMessenger = await hre.ethers.getContractFactory("L2CrossChainMessenger");
  const l2Messenger = await L2CrossChainMessenger.deploy(
    "0x7dB0d23f4E6e55fbe57229f9F522799AEB6Cc65F", // L2 Inbox
    "0x4Caa831C19D6259650fe4C92DDFbC847A129aBCA", // L2 Bridge
    "0xE7f14f7911E5b8eBf7b656862dF0E428E6c3aeBc", // L2 Outbox
    "0x0000000000000000000000000000000000000000" // Placeholder for L1 Factory address
  );
  await l2Messenger.deployed();
  console.log("L2CrossChainMessenger deployed to:", l2Messenger.address);

  // Deploy L1 contracts
  console.log("Deploying Factory...");
  const Factory = await hre.ethers.getContractFactory("Factory");
  const factory = await Factory.deploy(
    ethers.utils.parseEther("0.1"), // fee
    "0x0000000000000000000000000000000000000000" // LayerZero endpoint
  );
  await factory.deployed();
  console.log("Factory deployed to:", factory.address);

  console.log("Deploying CrossChainMessenger...");
  const CrossChainMessenger = await hre.ethers.getContractFactory("CrossChainMessenger");
  const l1Messenger = await CrossChainMessenger.deploy(
    "0x7dB0d23f4E6e55fbe57229f9F522799AEB6Cc65F", // L1 Inbox
    "0x4Caa831C19D6259650fe4C92DDFbC847A129aBCA", // L1 Bridge
    "0xE7f14f7911E5b8eBf7b656862dF0E428E6c3aeBc", // L1 Outbox
    factory.address,
    l2Messenger.address
  );
  await l1Messenger.deployed();
  console.log("CrossChainMessenger deployed to:", l1Messenger.address);

  // Set up the factory
  console.log("Setting up Factory...");
  const tx = await factory.setCrossChainMessenger(l1Messenger.address);
  await tx.wait();
  console.log("Factory setup complete");

  // Log all addresses for reference
  console.log("\nDeployment Summary:");
  console.log("------------------");
  console.log("L2CrossChainMessenger:", l2Messenger.address);
  console.log("Factory:", factory.address);
  console.log("CrossChainMessenger:", l1Messenger.address);
  console.log("------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 