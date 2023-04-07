// SPDX-License-Identifier: GPL-3

pragma solidity ^0.8.0;

import './RWD.sol';
import './Tether.sol';

contract DecentralBank {
    string public name = "Decentral Bank";
    address public owner;
    Tether public tether;
    RWD public rwd;

    uint constant public rewardDivisor = 10;

    address[] public stakers;

    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;
    
    constructor(RWD _rwd,Tether _tether) {
        owner = msg.sender;
        rwd = _rwd;
        tether = _tether;
    }

    function depositTokens(uint _amount) public {
        require(_amount > 0,"Deposit have to be greater than 0");
        //require(tether.balanceOf(msg.sender) >= _amount,"Insufficiant funds"); // transferFrom already checks this

        // transfer tether tokens to this contract address for staking
        tether.transferFrom(msg.sender,address(this),_amount);
        stakingBalance[msg.sender] += _amount;

        if ( !hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    /*function stackedTokens(address _from) public view returns(uint) {
        return stakingBalance[_from];
    }*/

    // issue rewards
    function issueTokens() public {
        require(msg.sender == owner);
        for( uint i = 0 ; i < stakers.length ; i++ ){
            address recipient = stakers[i];
            if(isStaking[recipient]){
                uint balance = stakingBalance[recipient];
                uint reward = balance / rewardDivisor;
                if(balance > 0){
                    rwd.transfer(recipient,reward);
                }
            }
            
        }
    }

    function unstakeTokens() public {
        require(isStaking[msg.sender] == true);

        uint amount = stakingBalance[msg.sender];
        
        isStaking[msg.sender] = false;
        stakingBalance[msg.sender] = 0;
        tether.transfer(msg.sender,amount);
    }

}