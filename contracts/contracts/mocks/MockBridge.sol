// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MockBridge {
    address public activeOutbox;

    constructor() {
        activeOutbox = address(this);
    }

    function setActiveOutbox(address _outbox) external {
        activeOutbox = _outbox;
    }
} 