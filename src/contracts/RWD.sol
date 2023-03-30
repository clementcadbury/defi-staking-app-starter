// SPDX-License-Identifier: GPL-3

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RWD is ERC20{
//contract Tether{
    
    constructor() ERC20("RewardToken","RWD") {
    //constructor() {
        _mint(msg.sender, 1000000000000000000000000);
    }

}