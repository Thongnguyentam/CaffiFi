# 🚀 **CaffiFi – The Ultimate AI-Powered Meme Coin Hub powered by Espresso Network**

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
```
owner & validators	0xb88d1d385f31A83a44c9E72219EBbB2a31f213F2	
batchPosters	0x8b1d2Abc5670c775AE0197e80b5beBAc40EeB75E	
espressoTEEVerifier	0x8354db765810dF8F24f1477B06e91E5b17a408bF	
```

Contract addresses on Devnet Mocha:
- **Factory**: 
- **Launchpad Agent**: 
- **Native Liquidity Pool**: 
- **Bookie Bet**: 

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
```
owner & validators	0xb88d1d385f31A83a44c9E72219EBbB2a31f213F2	
batchPosters	0x8b1d2Abc5670c775AE0197e80b5beBAc40EeB75E	
espressoTEEVerifier	0x8354db765810dF8F24f1477B06e91E5b17a408bF	
```

Contract addresses on Devnet Latte:
- **Factory**: 
- **Launchpad Agent**: 
- **Native Liquidity Pool**: 
- **Bookie Bet**: 



```
cast call \
--rpc-url https://arbitrum-sepolia-rpc.publicnode.com \
0xa9dDe469178A115f0c862f3AEf64053E347AA40b \
"latestConfirmed()(uint256)"
```

```
cast send --rpc-url https://arbitrum-sepolia-rpc.publicnode.com 0x6353d578392261dE652b02D13d8079147C729cae 'depositEth() external payable returns (uint256)' --private-key 0c6aaedebed8f32db344a74f5fda724c42a1b7053450ebfecd29ba0e0922dd6b  --value 500000000000000 -vvvv
```

```
cast send --rpc-url https://arbitrum-sepolia-rpc.publicnode.com 0x6353d578392261dE652b02D13d8079147C729cae 'depositEth() external payable returns (uint256)' --private-key bdf23c7f17c40c6a5cd3f193daea787bc27e0d64b75fc2618449182819357d24  --value 1000 -vvvv
```

Check recipient balance: 
```
cast balance 0xb88d1d385f31A83a44c9E72219EBbB2a31f213F2 --rpc-url http://127.0.0.1:8547
```
```
cast balance 0x8b1d2Abc5670c775AE0197e80b5beBAc40EeB75E --rpc-url http://127.0.0.1:8647
```

```
npx hardhat ignition deploy ignition/modules/Factory.js --network espressoOrbit --reset
```

Call the Factory:
```
cast call   0x7cEbB1BAe1E148c1f1A0f30B306E898DA05f12dc   "fee()(uint256)"   --rpc-url http://127.0.0.1:8547
```
