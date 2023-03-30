// SPDX-License-Identifier: GPL-3

pragma solidity ^0.8.0;

import './RWD.sol';
import './Tether.sol';

contract DecentralBank {
    string public name = "Decentral Bank";
    address public owner;
    Tether public tether;
    RWD public rwd;
    
    constructor(RWD _rwd,Tether _tether) {
        owner = msg.sender;
        rwd = _rwd;
        tether = _tether;
    }

}