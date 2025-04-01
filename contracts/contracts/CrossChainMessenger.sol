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
    
    // Mapping of chain ID to peer factory address
    mapping(uint32 => address) public peerFactories;
    // Array to keep track of all peer chain IDs
    uint32[] public peerChainIds;
    
    // Message types for different operations
    uint8 constant MSG_TYPE_CREATE_TOKEN = 1;
    uint8 constant MSG_TYPE_BRIDGE_TOKENS = 2;
    uint8 constant MSG_TYPE_LIQUIDITY_CREATED = 3;
    
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

    event PeerFactoryAdded(uint32 indexed chainId, address indexed factory);
    event PeerFactoryRemoved(uint32 indexed chainId);
    
    constructor(
        address _inbox,
        address _bridge,
        address _outbox,
        address _factory
    ) {
        inbox = IInbox(_inbox);
        bridge = IBridge(_bridge);
        outbox = IOutbox(_outbox);
        factory = Factory(_factory);
    }

    modifier onlyFactory() {
        require(msg.sender == address(factory), "Only factory can call");
        _;
    }

    /**
     * @notice Add or update a peer factory for a specific chain
     * @param chainId The chain ID of the peer
     * @param peerFactory The address of the factory on that chain
     */
    function setPeerFactory(uint32 chainId, address peerFactory) external onlyFactory {
        require(peerFactory != address(0), "Invalid peer factory address");
        require(chainId != block.chainid, "Cannot add peer for current chain");
        
        if (peerFactories[chainId] == address(0)) {
            peerChainIds.push(chainId);
        }
        peerFactories[chainId] = peerFactory;
        
        emit PeerFactoryAdded(chainId, peerFactory);
    }

    /**
     * @notice Remove a peer factory
     * @param chainId The chain ID of the peer to remove
     */
    function removePeerFactory(uint32 chainId) external onlyFactory {
        require(peerFactories[chainId] != address(0), "Peer factory doesn't exist");
        
        delete peerFactories[chainId];
        
        // Remove chain ID from array
        for (uint i = 0; i < peerChainIds.length; i++) {
            if (peerChainIds[i] == chainId) {
                peerChainIds[i] = peerChainIds[peerChainIds.length - 1];
                peerChainIds.pop();
                break;
            }
        }
        
        emit PeerFactoryRemoved(chainId);
    }

    /**
     * @notice Get all peer chain IDs
     * @return Array of chain IDs
     */
    function getPeerChainIds() external view returns (uint32[] memory) {
        return peerChainIds;
    }
    
    /**
     * @notice Sends a message to create a token on another chain
     * @param targetChainId The target chain ID
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _metadataURI Token metadata URI
     * @param _creator Token creator address
     */
    function sendCreateTokenToOtherChain(
        uint32 targetChainId,
        string memory _name,
        string memory _symbol,
        string memory _metadataURI,
        address _creator
    ) external payable onlyFactory {
        address targetFactory = peerFactories[targetChainId];
        require(targetFactory != address(0), "Target chain not configured");
        
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
     * @notice Sends a message to bridge tokens to another chain
     * @param targetChainId The target chain ID
     * @param _symbol Token symbol
     * @param _recipient Recipient address
     * @param _amount Amount of tokens
     */
    function sendBridgeTokensToOtherChain(
        uint32 targetChainId,
        string memory _symbol,
        address _recipient,
        uint256 _amount
    ) external onlyFactory {
        address targetFactory = peerFactories[targetChainId];
        require(targetFactory != address(0), "Target chain not configured");

        bytes32 messageId = keccak256(abi.encodePacked(
            block.timestamp,
            msg.sender,
            _symbol,
            _recipient,
            _amount
        ));

        bytes memory data = abi.encode(
            MSG_TYPE_BRIDGE_TOKENS,
            messageId,
            _symbol,
            _recipient,
            _amount
        );
        
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
     * @notice Sends a message to notify other chains that liquidity has been created
     * @param targetChainId The target chain ID
     * @param _symbol Token symbol
     */
    function sendLiquidityCreatedToOtherChain(
        uint32 targetChainId,
        string memory _symbol
    ) external onlyFactory {
        address targetFactory = peerFactories[targetChainId];
        require(targetFactory != address(0), "Target chain not configured");
        
        bytes32 messageId = keccak256(abi.encodePacked(
            block.timestamp,
            msg.sender,
            _symbol,
            "LIQUIDITY_CREATED"
        ));

        bytes memory data = abi.encode(
            MSG_TYPE_LIQUIDITY_CREATED,
            messageId,
            _symbol
        );
        
        uint256 baseFee = block.basefee;
        uint256 submissionCost = inbox.calculateRetryableSubmissionFee(
            data.length,
            baseFee
        );
        
        uint256 messageNum = inbox.createRetryableTicket{value: submissionCost}(
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
     * @notice Processes messages received from other chains
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
                uint32(block.chainid),
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
                uint32(block.chainid),
                messageId
            );
        } else if (msgType == MSG_TYPE_LIQUIDITY_CREATED) {
            (
                ,
                bytes32 messageId,
                string memory symbol
            ) = abi.decode(data, (uint8, bytes32, string));
            
            factory.handleLiquidityCreatedOnOtherChain(
                symbol,
                uint32(block.chainid),
                messageId
            );
        } else {
            revert("Invalid message type");
        }
        
        emit MessageReceivedFromChain(sender, uint32(block.chainid), data);
    }
} 