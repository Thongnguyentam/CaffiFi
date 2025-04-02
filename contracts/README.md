# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:


```
npx hardhat ignition deploy ignition/modules/Factory.js --network espressoOrbit --reset
npx hardhat ignition deploy ignition/modules/Factory.js --network latteOrbit --reset
npx hardhat run scripts/setPeers.js --network espressoOrbit
npx hardhat run scripts/setPeers.js --network latteOrbit
```

```
cast call \
--rpc-url https://arbitrum-sepolia-rpc.publicnode.com \
0xce8Ab94607b01BAEa7032C9055335800438adF03 \
"latestConfirmed()(uint256)"
```

```
cast send --rpc-url https://arbitrum-sepolia-rpc.publicnode.com 0x7dB0d23f4E6e55fbe57229f9F522799AEB6Cc65F 'depositEth() external payable returns (uint256)' --private-key 0c6aaedebed8f32db344a74f5fda724c42a1b7053450ebfecd29ba0e0922dd6b  --value 100000000000000000 -vvvv
```

```
cast send --rpc-url https://arbitrum-sepolia-rpc.publicnode.com 0x6353d578392261dE652b02D13d8079147C729cae 'depositEth() external payable returns (uint256)' --private-key bdf23c7f17c40c6a5cd3f193daea787bc27e0d64b75fc2618449182819357d24  --value 100000000000000000 -vvvv
```

Check recipient balance: 
```
cast balance 0xb88d1d385f31A83a44c9E72219EBbB2a31f213F2 --rpc-url http://127.0.0.1:8547
```
```
cast balance 0xb88d1d385f31A83a44c9E72219EBbB2a31f213F2 --rpc-url http://127.0.0.1:8647
```

```
npx hardhat ignition deploy ignition/modules/Factory.js --network espressoOrbit --reset
```

Call the Factory:

Mocha:
```
cast call   0x53083e4c228Dad830791a4D41eD4e0b0Ec8B7717   "fee()(uint256)"   --rpc-url http://127.0.0.1:8547
```

Latte:
```
cast call   0x45Ac4D4Cb517c984e652061a7E43beeb3e827B2f   "fee()(uint256)"   --rpc-url http://127.0.0.1:8647
```

sending account 1 to account 2 on Mocha
```
cast send 0xb88d1d385f31A83a44c9E72219EBbB2a31f213F2 --value 50997303208954440 --private-key bdf23c7f17c40c6a5cd3f193daea787bc27e0d64b75fc2618449182819357d24 --rpc-url http://127.0.0.1:8647
```

create functions:
```
cast send \
  --rpc-url http://127.0.0.1:8547 \
  0x53083e4c228Dad830791a4D41eD4e0b0Ec8B7717 \
  "create(string,string,string,address)" \
  "Test Token" \
  "TEST" \
  "https://example.com/metadata" \
  0xb88d1d385f31A83a44c9E72219EBbB2a31f213F2 \
  --value 10000000000000000 \
  --private-key 0c6aaedebed8f32db344a74f5fda724c42a1b7053450ebfecd29ba0e0922dd6b
```

get total token 
```
cast call 0x53083e4c228Dad830791a4D41eD4e0b0Ec8B7717 "totalTokens()(uint256)" --rpc-url http://127.0.0.1:8647
```

get chainId of factory
```
cast call 0xa3b7BDfb5b8392DDAEdDAD05F7e07c0253042B66 "chainId()(uint32)" --rpc-url http://127.0.0.1:8547

cast call 0xa3b7BDfb5b8392DDAEdDAD05F7e07c0253042B66 "chainId()(uint32)" --rpc-url http://127.0.0.1:8647
```