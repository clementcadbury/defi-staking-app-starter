// SPDX-License-Identifier: GPL-3

pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/utils/introspection/ERC165.sol';

contract Tether is ERC20,ERC165{
//contract Tether{

    //string public cadbury;
    
    constructor() ERC20("FakeTether","FUSD") {
    //constructor() {
        _mint(msg.sender, 1000000000000000000000000);
        //cadbury = "prout";
    }

    /*function getCadbury() public view returns(string memory) {
        return cadbury;
    }*/

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
       return interfaceId == type(IERC20).interfaceId || super.supportsInterface(interfaceId);
    }
}