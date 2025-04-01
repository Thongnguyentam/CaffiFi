// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IInbox {
    function createRetryableTicket(
        address to,
        uint256 l2CallValue,
        uint256 maxSubmissionCost,
        address excessFeeRefundAddress,
        address callValueRefundAddress,
        uint256 gasLimit,
        uint256 maxFeePerGas,
        bytes calldata data
    ) external payable returns (uint256);

    function calculateRetryableSubmissionFee(
        uint256 dataLength,
        uint256 baseFee
    ) external view returns (uint256);
}

interface IBridge {
    function activeOutbox() external view returns (address);
}

interface IOutbox {
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
    ) external;
}

import {Factory} from "./Factory.sol";

contract CrossChainMessenger {
    IInbox public immutable inbox;
    IBridge public immutable bridge;
    IOutbox public immutable outbox;
    Factory public immutable factory;
    
    // Target factory on the other chain
    address public immutable targetFactory;
    uint32 public immutable targetChainId;
    
    // Message types for different operations
    uint8 constant MSG_TYPE_CREATE_TOKEN = 1;
    uint8 constant MSG_TYPE_BRIDGE_TOKENS = 2;
    
    event MessageSentToChain(
        uint256 indexed messageNum,
        address indexed sender,
        uint32 indexed targetChainId,
        bytes data
    );
    
    event MessageReceivedFromChain(
        address indexed sender,
        uint32 indexed sourceChainId,
        bytes data
    );
    
    constructor(
        address _inbox,
        address _bridge,
        address _outbox,
        address _factory,
        address _targetFactory,
        uint32 _targetChainId
    ) {
        inbox = IInbox(_inbox);
        bridge = IBridge(_bridge);
        outbox = IOutbox(_outbox);
        factory = Factory(_factory);
        targetFactory = _targetFactory;
        targetChainId = _targetChainId;
    }
    
    /**
     * @notice Sends a message to create a token on the other chain
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _metadataURI Token metadata URI
     * @param _creator Token creator address
     */
    function sendCreateTokenToOtherChain(
        string memory _name,
        string memory _symbol,
        string memory _metadataURI,
        address _creator
    ) external payable {
        require(msg.sender == address(factory), "Only factory can call");
        
        bytes32 messageId = keccak256(abi.encodePacked(
            block.timestamp,
            msg.sender,
            _name,
            _symbol,
            _creator
        ));

        // Encode the message data
        bytes memory data = abi.encode(
            MSG_TYPE_CREATE_TOKEN,
            messageId,
            _name,
            _symbol,
            _metadataURI,
            _creator
        );
        
        // Calculate submission cost with current block's base fee
        uint256 baseFee = block.basefee;
        uint256 submissionCost = inbox.calculateRetryableSubmissionFee(
            data.length,
            baseFee
        );
        
        require(msg.value >= submissionCost, "Insufficient funds for submission");
        
        // Send message to other chain
        uint256 messageNum = inbox.createRetryableTicket{value: msg.value}(
            targetFactory,
            0,
            submissionCost,
            msg.sender,
            msg.sender,
            3000000,
            baseFee * 2,
            data
        );
        
        emit MessageSentToChain(messageNum, msg.sender, targetChainId, data);
    }

    /**
     * @notice Sends a message to bridge tokens to the other chain
     * @param _symbol Token symbol
     * @param _recipient Recipient address
     * @param _amount Amount of tokens
     * @param _targetChainId Target chain ID
     */
    function sendBridgeTokensToOtherChain(
        string memory _symbol,
        address _recipient,
        uint256 _amount,
        uint32 _targetChainId
    ) external {
        require(msg.sender == address(factory), "Only factory can call");
        require(_targetChainId == targetChainId, "Invalid target chain");

        bytes32 messageId = keccak256(abi.encodePacked(
            block.timestamp,
            msg.sender,
            _symbol,
            _recipient,
            _amount
        ));

        // Encode the message data
        bytes memory data = abi.encode(
            MSG_TYPE_BRIDGE_TOKENS,
            messageId,
            _symbol,
            _recipient,
            _amount
        );
        
        // Send message to other chain
        uint256 messageNum = inbox.createRetryableTicket{value: 0}(
            targetFactory,
            0,
            0,
            msg.sender,
            msg.sender,
            3000000,
            block.basefee * 2,
            data
        );
        
        emit MessageSentToChain(messageNum, msg.sender, targetChainId, data);
    }
    
    /**
     * @notice Processes messages received from the other chain
     * @param sender The sender's address on the other chain
     * @param data The message data
     */
    function processMessageFromChain(
        address sender,
        bytes memory data
    ) external {
        require(msg.sender == address(outbox), "Only outbox can call");
        
        (uint8 msgType) = abi.decode(data, (uint8));
        
        if (msgType == MSG_TYPE_CREATE_TOKEN) {
            (
                ,
                bytes32 messageId,
                string memory name,
                string memory symbol,
                string memory metadataURI,
                address creator
            ) = abi.decode(data, (uint8, bytes32, string, string, string, address));
            
            factory.handleTokenCreatedOnOtherChain(
                name,
                symbol,
                metadataURI,
                creator,
                targetChainId,
                messageId
            );
        } else if (msgType == MSG_TYPE_BRIDGE_TOKENS) {
            (
                ,
                bytes32 messageId,
                string memory symbol,
                address recipient,
                uint256 amount
            ) = abi.decode(data, (uint8, bytes32, string, address, uint256));
            
            factory.handleBridgeTokensReceived(
                symbol,
                recipient,
                amount,
                targetChainId,
                messageId
            );
        } else {
            revert("Invalid message type");
        }
        
        emit MessageReceivedFromChain(sender, targetChainId, data);
    }
} 