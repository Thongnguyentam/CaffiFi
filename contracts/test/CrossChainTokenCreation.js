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

        // Deploy NativeLiquidityPool for both chains
        const NativeLiquidityPool = await ethers.getContractFactory("NativeLiquidityPool")
        const liquidityPoolA = await NativeLiquidityPool.deploy(await factoryA.getAddress())
        const liquidityPoolB = await NativeLiquidityPool.deploy(await factoryB.getAddress())

        // Set liquidity pools in factories
        await factoryA.setLiquidityPool(await liquidityPoolA.getAddress())
        await factoryB.setLiquidityPool(await liquidityPoolB.getAddress())

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
            liquidityPoolA,
            liquidityPoolB,
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
                    await messengerA.getAddress(),
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

    describe("Token Bridging", function () {
        it("Should bridge tokens from origin chain to target chain", async function () {
            const { 
                factoryA, 
                factoryB, 
                messengerA,
                messengerB,
                mockInbox,
                mockOutbox,
                creator,
                buyer 
            } = await loadFixture(deployContractsFixture)

            // First create a token on Chain A
            const tokenName = "Bridge Test Token"
            const tokenSymbol = "BTT"
            const tokenURI = "https://example.com/token"
            const amountToBuy = ethers.parseEther("100") // Buy 100 tokens
            const amountToBridge = ethers.parseEther("50") // Bridge 50 tokens

            // Create token on Chain A (origin chain)
            await factoryA.connect(creator).create(
                tokenName,
                tokenSymbol,
                tokenURI,
                ethers.ZeroAddress,
                { value: FEE }
            )

            // Get the last message sent to the mock inbox for token creation
            const createTokenMessage = await mockInbox.lastMessage()

            // Forward the token creation message to Chain B
            await mockOutbox.forwardMessage(
                await messengerB.getAddress(),
                await messengerA.getAddress(),
                createTokenMessage
            )

            // Get token addresses on both chains
            const tokenAddressA = await factoryA.tokenBySymbol(tokenSymbol)
            const tokenAddressB = await factoryB.tokenBySymbol(tokenSymbol)
            const TokenFactory = await ethers.getContractFactory("Token")
            const tokenA = TokenFactory.attach(tokenAddressA)
            const tokenB = TokenFactory.attach(tokenAddressB)

            // Get the price for buying tokens
            const price = await factoryA.getPriceForTokens(tokenAddressA, amountToBuy)

            // Buy tokens on Chain A
            await factoryA.connect(buyer).buy(tokenAddressA, amountToBuy, { value: price })

            // Verify buyer has received tokens
            expect(await tokenA.balanceOf(buyer.address)).to.equal(amountToBuy)

            // Approve factory to spend tokens
            await tokenA.connect(buyer).approve(factoryA.getAddress(), amountToBridge)

            // Bridge tokens from Chain A to Chain B
            await expect(factoryA.connect(buyer).bridgeTokens(
                tokenSymbol,
                amountToBridge,
                CHAIN_B_ID
            )).to.emit(factoryA, "TokensBridged")
            .withArgs(tokenAddressA, tokenSymbol, buyer.address, amountToBridge, CHAIN_B_ID)

            // Get the last message sent to the mock inbox for token bridging
            const bridgeTokenMessage = await mockInbox.lastMessage()

            // Forward the bridge message through mock outbox to simulate cross-chain communication
            await mockOutbox.forwardMessage(
                await messengerB.getAddress(),
                await messengerA.getAddress(),
                bridgeTokenMessage
            )

            // Verify tokens were burned on Chain A
            expect(await tokenA.balanceOf(buyer.address)).to.equal(amountToBuy - amountToBridge)

            // Verify tokens were minted on Chain B
            expect(await tokenB.balanceOf(buyer.address)).to.equal(amountToBridge)
        })
    })

    describe("Liquidity Pool Creation", function () {
        it("Should create liquidity pool and notify other chain", async function () {
            const { 
                factoryA, 
                factoryB, 
                liquidityPoolA,
                messengerA,
                messengerB,
                mockInbox,
                mockOutbox,
                creator,
                buyer 
            } = await loadFixture(deployContractsFixture)

            // First create a token on Chain A
            const tokenName = "Liquidity Test Token"
            const tokenSymbol = "LTT"
            const tokenURI = "https://example.com/token"
            const amountToBuy = ethers.parseEther("10000") // Buy 10000 tokens each time

            // Create token on Chain A (origin chain)
            await factoryA.connect(creator).create(
                tokenName,
                tokenSymbol,
                tokenURI,
                ethers.ZeroAddress,
                { value: FEE }
            )

            // Get the last message sent to the mock inbox for token creation
            const createTokenMessage = await mockInbox.lastMessage()

            // Forward the token creation message to Chain B
            await mockOutbox.forwardMessage(
                await messengerB.getAddress(),
                await messengerA.getAddress(),
                createTokenMessage
            )

            // Get token addresses on both chains
            const tokenAddressA = await factoryA.tokenBySymbol(tokenSymbol)
            const tokenAddressB = await factoryB.tokenBySymbol(tokenSymbol)
            const TokenFactory = await ethers.getContractFactory("Token")
            const tokenA = TokenFactory.attach(tokenAddressA)
            const tokenB = TokenFactory.attach(tokenAddressB)

            // Get the price for buying tokens first time
            const price1 = await factoryA.getPriceForTokens(tokenAddressA, amountToBuy)

            // First purchase of 10000 tokens
            await factoryA.connect(buyer).buy(tokenAddressA, amountToBuy, { value: price1 })

            // Get the price for buying tokens second time
            const price2 = await factoryA.getPriceForTokens(tokenAddressA, amountToBuy)

            // Second purchase of 10000 tokens to reach the target
            await factoryA.connect(buyer).buy(tokenAddressA, amountToBuy, { value: price2 })

            // Verify the sale is closed and liquidity is created on Chain A
            const saleA = await factoryA.tokenToSale(tokenAddressA)
            expect(saleA.isOpen).to.equal(false)
            expect(saleA.isLiquidityCreated).to.equal(true)
            expect(saleA.raised).to.be.at.least(ethers.parseEther("3")) // At least 3 ETH raised

            // Verify liquidity pool has received tokens and ETH
            expect(await tokenA.balanceOf(await liquidityPoolA.getAddress())).to.be.gt(0)
            expect(await ethers.provider.getBalance(await liquidityPoolA.getAddress())).to.be.gt(0)

            // Get the last message sent to the mock inbox for liquidity creation
            const liquidityMessage = await mockInbox.lastMessage()

            // Forward the liquidity creation message to Chain B
            await mockOutbox.forwardMessage(
                await messengerB.getAddress(),
                await messengerA.getAddress(),
                liquidityMessage
            )

            // Verify Chain B received the liquidity creation notification
            const saleB = await factoryB.tokenToSale(tokenAddressB)
            expect(saleB.isLiquidityCreated).to.equal(true)
            expect(saleB.isOriginChain).to.equal(false)

            // Verify buyer's final token balance
            expect(await tokenA.balanceOf(buyer.address)).to.equal(amountToBuy*2n)
        })
    })
}) 