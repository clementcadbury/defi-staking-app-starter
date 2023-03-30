// SPDX-License-Identifier: GPL-3

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Tether is ERC20{
//contract Tether{

    string public cadbury;
    
    constructor() ERC20("Tether","USDT") {
    //constructor() {
        _mint(msg.sender, 1000000000000000000000000);
        cadbury = "prout";
    }

    function getCadbury() public view returns(string memory) {
        return cadbury;
    }
}