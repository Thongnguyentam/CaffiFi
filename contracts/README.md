# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```


```
npx hardhat ignition deploy ignition/modules/Factory.js --network espressoOrbit --reset
npx hardhat ignition deploy ignition/modules/Factory.js --network latteOrbit --reset
npx hardhat run scripts/setPeers.js --network espressoOrbit
npx hardhat run scripts/setPeers.js --network latteOrbit
```
