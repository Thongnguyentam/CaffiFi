const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Cross-Chain Token Creation", function () {
    const FEE = ethers.parseEther("0.01")
    const CHAIN_A_ID = 10000096 // Mocha chain ID
    const CHAIN_B_ID = 10000099 // Latte chain ID

    async function deployMockInbox() {
        const MockInbox = await ethers.getContractFactory("MockInbox")
        return await MockInbox.deploy()
    }

    async function deployMockBridge() {
        const MockBridge = await ethers.getContractFactory("MockBridge")
        return await MockBridge.deploy()
    }

    async function deployMockOutbox() {
        const MockOutbox = await ethers.getContractFactory("MockOutbox")
        return await MockOutbox.deploy()
    }

    async function deployContractsFixture() {
        const [deployer, creator, buyer] = await ethers.getSigners()

        // Deploy mock contracts for testing
        const mockInbox = await deployMockInbox()
        const mockBridge = await deployMockBridge()
        const mockOutbox = await deployMockOutbox()

        // Deploy Factory on Chain A (Mocha)
        const Factory = await ethers.getContractFactory("Factory")
        const factoryA = await Factory.deploy(FEE, CHAIN_A_ID)

        // Deploy Factory on Chain B (Latte)
        const factoryB = await Factory.deploy(FEE, CHAIN_B_ID)

        // Deploy CrossChainMessenger for Chain A
        const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger")
        const messengerA = await CrossChainMessenger.deploy(
            await mockInbox.getAddress(),
            await mockBridge.getAddress(),
            await mockOutbox.getAddress(),
            await factoryA.getAddress(),
            await factoryB.getAddress(),
            CHAIN_B_ID
        )

        // Deploy CrossChainMessenger for Chain B
        const messengerB = await CrossChainMessenger.deploy(
            await mockInbox.getAddress(),
            await mockBridge.getAddress(),
            await mockOutbox.getAddress(),
            await factoryB.getAddress(),
            await factoryA.getAddress(),
            CHAIN_A_ID
        )

        // Set the CrossChainMessenger in both Factories
        await factoryA.setCrossChainMessenger(await messengerA.getAddress())
        await factoryB.setCrossChainMessenger(await messengerB.getAddress())

        return { 
            factoryA, 
            factoryB, 
            messengerA, 
            messengerB, 
            mockInbox,
            mockBridge,
            mockOutbox,
            deployer, 
            creator, 
            buyer 
        }
    }

    describe("Token Creation", function () {
        it("Should create token on origin chain and mirror on target chain", async function () {
            const { 
                factoryA, 
                factoryB, 
                messengerA,
                messengerB,
                mockInbox,
                mockOutbox,
                creator 
            } = await loadFixture(deployContractsFixture)

            const tokenName = "Dapp Uni"
            const tokenSymbol = "DAPP"
            const tokenURI = "https://pinata.cloud/ipfs"

            // Create token on Chain A (origin chain)
            await expect(factoryA.connect(creator).create(
                tokenName,
                tokenSymbol,
                tokenURI,
                ethers.ZeroAddress,
                { value: FEE }
            )).to.emit(factoryA, "Created")

            // Verify token was created correctly on Chain A
            const tokenA = await factoryA.tokenBySymbol(tokenSymbol)
            expect(tokenA).to.not.equal(ethers.ZeroAddress)

            const saleA = await factoryA.tokenToSale(tokenA)
            expect(saleA.name).to.equal(tokenName)
            expect(saleA.symbol).to.equal(tokenSymbol)
            expect(saleA.metadataURI).to.equal(tokenURI)
            expect(saleA.creator).to.equal(creator.address)
            expect(saleA.isOpen).to.equal(true)
            expect(saleA.isOriginChain).to.equal(true)

            // Get the last message sent to the mock inbox
            const lastMessage = await mockInbox.lastMessage()
            
            // Simulate cross-chain message by forwarding through mock outbox
            await expect(
                mockOutbox.forwardMessage(
                    await messengerB.getAddress(),
                    lastMessage
                )
            ).to.emit(factoryB, "TokenCreatedOnOtherChain")

            // Verify mirror token was created correctly on Chain B
            const tokenB = await factoryB.tokenBySymbol(tokenSymbol)
            expect(tokenB).to.not.equal(ethers.ZeroAddress)
            expect(tokenB).to.not.equal(tokenA) // Different addresses on different chains

            const saleB = await factoryB.tokenToSale(tokenB)
            expect(saleB.name).to.equal(tokenName)
            expect(saleB.symbol).to.equal(tokenSymbol)
            expect(saleB.metadataURI).to.equal(tokenURI)
            expect(saleB.creator).to.equal(creator.address)
            expect(saleB.isOpen).to.equal(false) // Not open for sale on mirror chain
            expect(saleB.isOriginChain).to.equal(false) // Not the origin chain

            // Verify the Token contract state
            const TokenFactory = await ethers.getContractFactory("Token")
            const tokenContractA = TokenFactory.attach(tokenA)
            const tokenContractB = TokenFactory.attach(tokenB)

            // Chain A token should have full supply
            expect(await tokenContractA.totalSupply()).to.equal(ethers.parseEther("500000"))
            // Chain B token should have 0 supply initially
            expect(await tokenContractB.totalSupply()).to.equal(0)
        })
    })
}) 