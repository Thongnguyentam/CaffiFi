# 🫘 **CaffiFi – The Ultimate AI-Powered Meme Coin Hub powered by Espresso Network**

Your all-in-one decentralized hub for cross-chain meme coin factory, marketplace, and prediction market—exclusively powered by Espresso Network.

### Devnet Mocha (chainId: 10000096):
```
RollupProxy	0xa9dDe469178A115f0c862f3AEf64053E347AA40b 
Inbox	0x7dB0d23f4E6e55fbe57229f9F522799AEB6Cc65F
Outbox	0xE7f14f7911E5b8eBf7b656862dF0E428E6c3aeBc
Bridge (proxy)	0x4Caa831C19D6259650fe4C92DDFbC847A129aBCA
SequencerInbox	0xE71b60536A5d7953a3e61B3EEa9911584076346f
AdminProxy	0x26B7ca8EEaC57e34F536Fa38ce6220899c8B75A1
EventInbox	0x50983C74Af33e9808EA49Ec339C85B7F740902e1
ChallengeManager	0xe751256f341D1061d3A72f42fBC7fd3d0006b321
```

### Devnet Latte (chainId: 10000099):
https://sepolia.arbiscan.io/tx/0x0aff962550a3c4fd2b9e8dd1113a5b9b5f48ea97f26de6c88e3d5d137bda37c6#eventlog

```
RollupProxy	0xce8Ab94607b01BAEa7032C9055335800438adF03 
Inbox	0x6353d578392261dE652b02D13d8079147C729cae
Outbox	0x06b600717d8F8399c9E2BC2E5f59F71c078f188a
Bridge (proxy)	0xC65f739c8b38Bb5Af393d98cc0AC287A3074A316
SequencerInbox	0xbdF2C3cc2fE8C11a7319743EdD32cF6dD7420ee9
AdminProxy	0x39D74622c605251303c688908baD906DE065b5Ce
EventInbox	0x33Deab60573f6a573fb8aeb2245917F87F3Abde5
ChallengeManager	0x213F1D4C8663699Ba8a8D1589BB9ECbA902D0827
```

## ☕ Overview

CaffiFi transforms cross-chain token launches, meme coin research, trading, and marketing into seamless, automated processes using cutting-edge agentic AI and multi-agent systems. Whether you're a trader, creator, or investor, our AI-powered strategies put you ahead of the curve.

## ☕ Key Features
### 1. 🫘 Espresso as a Confirmation Layer (Caffeinated Chain)

- Seamless Integration with Arbitrum Nitro & TEE
- Espresso Light Client Contract for Cross-Chain Proof of Finality for cross-chain transaction
- Track State Updates with a Light Client on the Destination Chain

### 2. 🚀 Interactive Cross-chain Memecoin Launchpad with Anti-Rug Mechanism
- Cross-chain creating token and send token between two Orbit Arbitrum chains.
- AI-powered token generation and deployment
- Fair launch mechanics with anti-rug pull protection
- 10-day linear vesting schedule and 1 month of liquidity locking to prevent rug
- Custom bonding curve for sustainable fundraising
- Automated liquidity management, enforcing liquidity locks to prevent token creators from exiting early.
- Easily launch tokens via web/chatbot—just submit a joke or meme idea!
- Buy and swap tokens effortlessly through chat—just a few clicks to confirm transactions

### 3. ♨ Betting Marketplace
- Place bets on meme coin trends, price movements, and crypto events
- Fully transparent, on-chain execution for trustless betting
- Smart contract-secured fund management
- Category-based filtering and easy stake positioning

## FUTURE DEVELOPMENT
### 4. ☕︎  [IN-PROGRESS] CROSS-CHAIN TRADING
- BONDING CURVE
- CROSS-CHAIN TRADING

### 5. ☕︎  [IN-PROGRESS] Multi-Agent AI Framework
- News Agent: Real-time crypto news monitoring
- Token Analysis Agent: Market trend analysis
- Dex Flow Agent: Enables seamless token buys/swaps with Eth, requiring only the token address
- Social Sentiment Agent: Cross-platform sentiment analysis
- Search Agent: New token discovery
- Swap Agent: Optimal liquidity pool routing
  
### 6. ⛾ [IN-PROGRESS] AutoShill 
- Automated viral tweet generation – Crafts engaging and high-impact tweets to maximize visibility.
- Trending discussion engagement – Identifies and participates in relevant trending topics to boost reach.
- Dynamic social media presence management – Maintains a consistent and interactive brand presence.
- Smart reply system – Responds intelligently to discussions, ensuring organic engagement.
- Anti-bot detection compliance – Ensures tweets comply with X’s detection systems to prevent flagging
- Customizable shill strategies – Allows users to define parameters for targeted audience engagement.
- Seamless API integration – Easily connects with existing platforms for automated execution.

## ☕ Technology Stack

### 🤎 Frontend & UI

![Next.js](https://img.shields.io/badge/Next.js%2014-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### ⛾ AI Framework

![ElizaOS](https://img.shields.io/badge/ElizaOS-FF6B6B?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PC9zdmc+&logoColor=white)

### 🫘 Blockchain & Smart Contracts

![Solidity](https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white)
![Hardhat](https://img.shields.io/badge/Hardhat-FFD700?style=for-the-badge&logo=hardhat&logoColor=black)

### ☕︎ Storage & IPFS

![Pinata](https://img.shields.io/badge/Pinata-E4405F?style=for-the-badge&logo=pinata&logoColor=white)

### 🌰 AI & Integration

![OpenAI](https://img.shields.io/badge/GPT--4-412991?style=for-the-badge&logo=openai&logoColor=white)
![Twitter API](https://img.shields.io/badge/Twitter%20API-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)

## ☕ Getting Started

### 🌰 Prerequisites

- Node.js 18+
- Crypto wallet (compatible with RainbowKit)
- pnpm package manager

### 🌰 Installation

#### **1. Clone the Repository**

```bash
git clone https://github.com/Thongnguyentam/CaffiFi.git
cd CaffiFi
```

#### **2. Set Up Environment Variables**

```bash
# Copy sample environment files
cp frontend/.env.example frontend/.env
cp eliza/.env.example eliza/.env

# Configure your environment variables
```

#### **3. Frontend Setup**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
# or
bun install

# Start the development server
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

This will start the frontend on [http://localhost:3000](http://localhost:3000).

#### **4. Running the Eliza Agent**

In a new terminal window:

```bash
cd eliza
pnpm install
pnpm build
pnpm start --character="characters/crypto-sage.json"
```

## 🌐 Access Points

- Frontend: [http://localhost:3000](http://localhost:3000)
- ZerePy Agent: [http://localhost:8000](http://localhost:8000)
- Eliza Agent: [http://localhost:8000](http://localhost:3001)

## ☕ Built By

CaffiFi is developed by a team of top university researchers and blockchain developers, passionate about crypto, AI, and market analytics.

## ☕ Support

For support, please reach out to our team or join our community channels.

_Powered by Espresso - Revolutionizing the meme economy, one token at a time._
