// SPDX-License-Identifier: GPL-3

pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/utils/introspection/ERC165.sol';

contract Tether is ERC20,ERC165{
    
    constructor() ERC20("FakeTether","FUSD") {
        _mint(msg.sender, 1000000000000000000000000); // 1 000 000
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
       return interfaceId == type(IERC20).interfaceId || super.supportsInterface(interfaceId);
    }
}