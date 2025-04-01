// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract Token is ERC20, ERC20Burnable {
    address payable public owner;
    address public creator;

    string public metadataURI; // Stores IPFS metadata JSON URI

    // // Add mapping to track unique holders
    // mapping(address => bool) public isHolder;
    // uint256 public totalHolders;

    constructor(
        address _creator,
        string memory _name,
        string memory _symbol,
        string memory _metadataURI,
        uint256 _totalSupply
    ) ERC20(_name, _symbol) {
        owner = payable(msg.sender);
        creator = _creator;
        metadataURI = _metadataURI;
        _mint(msg.sender, _totalSupply);
    }

    function mint(address receiver, uint256 mintQty) external {
        require(msg.sender == owner, "Mint can only be called by the owner");
        _mint(receiver, mintQty);
    }

    // Override burn from ERC20Burnable to add owner check
    function burn(uint256 amount) public override {
        // allows owner or token holder to burn their own tokens
        require(msg.sender == owner || msg.sender == _msgSender(), "Not authorized to burn"); 
        super.burn(amount);
    }

    // Override burnFrom from ERC20Burnable to add owner check
    function burnFrom(address account, uint256 amount) public override {
        require(msg.sender == owner || msg.sender == account, "Not authorized to burn");
        super.burnFrom(account, amount);
    }

    // function _update(address from, address to, uint256 amount) internal virtual override{
    //     super._update(from, to, amount);

    //     if(from != address(0) && balanceOf(from) == 0){
    //         isHolder[from] = false;
    //         totalHolders--;
    //     }
        
    //     if(to != address(0) && !isHolder[to]){
    //         isHolder[to] = true;
    //         totalHolders++;
    //     }
    // }

    // function getTotalHolders() external view returns (uint256){
    //     return totalHolders;
    // }
}