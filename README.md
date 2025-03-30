```
RollupProxy	0xa9dDe469178A115f0c862f3AEf64053E347AA40b ✅ (your rollup chain)
Inbox	0x7dB0d23f4E6e55fbe57229f9F522799AEB6Cc65F
Outbox	0xE7f14f7911E5b8eBf7b656862dF0E428E6c3aeBc
Bridge (proxy)	0x4Caa831C19D6259650fe4C92DDFbC847A129aBCA
SequencerInbox	0xE71b60536A5d7953a3e61B3EEa9911584076346f
AdminProxy	0x26B7ca8EEaC57e34F536Fa38ce6220899c8B75A1
EventInbox	0x50983C74Af33e9808EA49Ec339C85B7F740902e1
ChallengeManager	0xe751256f341D1061d3A72f42fBC7fd3d0006b321
```
```
chainId	10000096	✅ Custom, unique ID
owner & validators	0xb88d1d385f31A83a44c9E72219EBbB2a31f213F2	✅ Same wallet, fine for test
batchPosters	0x8b1d2Abc5670c775AE0197e80b5beBAc40EeB75E	✅ Separate address, good
espressoTEEVerifier	0x8354db765810dF8F24f1477B06e91E5b17a408bF	✅ Correct mock verifier for testnet​
```
```
cast call \
--rpc-url https://arbitrum-sepolia-rpc.publicnode.com \
0xa9dDe469178A115f0c862f3AEf64053E347AA40b \
"latestConfirmed()(uint256)"
```

```
cast send --rpc-url https://arbitrum-sepolia-rpc.publicnode.com 0x7dB0d23f4E6e55fbe57229f9F522799AEB6Cc65F 'depositEth() external payable returns (uint256)' --private-key 0c6aaedebed8f32db344a74f5fda724c42a1b7053450ebfecd29ba0e0922dd6b  --value 500000000000000 -vvvv
```

Check recipient balance: 
```
cast balance 0xb88d1d385f31A83a44c9E72219EBbB2a31f213F2 --rpc-url http://127.0.0.1:8547
```

```
npx hardhat ignition deploy ignition/modules/Factory.js --network espressoOrbit --reset
```

Call the Factory:
```
cast call   0x7cEbB1BAe1E148c1f1A0f30B306E898DA05f12dc   "fee()(uint256)"   --rpc-url http://127.0.0.1:8547
```
