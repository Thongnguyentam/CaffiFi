// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MockInbox {
    bytes public lastMessage;
    uint256 public messageCount;

    function createRetryableTicket(
        address to,
        uint256 l2CallValue,
        uint256 maxSubmissionCost,
        address excessFeeRefundAddress,
        address callValueRefundAddress,
        uint256 gasLimit,
        uint256 maxFeePerGas,
        bytes calldata data
    ) external payable returns (uint256) {
        lastMessage = data;
        messageCount++;
        return messageCount;
    }

    function calculateRetryableSubmissionFee(
        uint256 dataLength,
        uint256 baseFee
    ) external pure returns (uint256) {
        return 0; // For testing, return 0 fee
    }
} 