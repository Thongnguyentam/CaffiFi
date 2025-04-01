// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ICrossChainMessenger {
    function processMessageFromChain(address sender, bytes memory data) external;
}

contract MockOutbox {
    address public l2ToL1Sender;

    function executeTransaction(
        bytes32[] calldata proof,
        uint256 index,
        address l2Sender,
        address to,
        uint256 l2Block,
        uint256 l1Block,
        uint256 l2Timestamp,
        uint256 value,
        bytes calldata data
    ) external {
        l2ToL1Sender = l2Sender;
        // Mock execution - do nothing
    }

    // Helper function for testing to simulate message forwarding
    function forwardMessage(
        address messenger,
        address sender,
        bytes memory data
    ) external {
        ICrossChainMessenger(messenger).processMessageFromChain(sender, data);
    }
} 