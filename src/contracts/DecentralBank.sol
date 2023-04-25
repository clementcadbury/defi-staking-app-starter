// SPDX-License-Identifier: GPL-3

pragma solidity ^0.8.0;

import './RWD.sol';
import './FakeTether.sol';

contract DecentralBank {

    /* ========== STATE VARIABLES ========== */

    string public name = "Decentral Bank";
    address public owner;

    // synthetix RewardStaking
    // https://www.youtube.com/watch?v=pFX1-kNrJFU
    // https://solidity-by-example.org/defi/staking-rewards/
    // https://ethereum.stackexchange.com/questions/124024/understanding-rewardrate-and-rewardpertoken-in-synthetix-staking-contract

    FakeTether public fakeTether; // staking token
    RWD public rwd; // reward token

    uint public rewardRate = 10000 * 1e18 / ( 24 * uint(3600) ); // token rewardé au total par unité de temps ( la seconde ) = 10000 par jour
    uint public lastUpdateTime; // timestamp du dernier mouvement
    uint public rewardPerTokenStored; // somme de gauche, de 0 au dernier mouvement

    mapping(address => uint) public userRewardPerTokenPaid; // somme de droite, de 0 au dernier mouvement du user
    mapping(address => uint) public rewards; // rewards du user non réclamées jusqu'au dernier mouvement

    uint public totalSupply; // total de token staké (fakeTether)

    mapping(address => uint) public balanceOf; // token fakeTether staké par user

    event Stake(address indexed user, uint amount);
    event Unstake(address indexed user, uint amount);
    event GetReward(address indexed user, uint amount);
    event AirDrop(address indexed user, uint amount);

    /* ========== CONSTRUCTOR ========== */
    
    constructor(RWD _rwd,FakeTether _fakeTether) {
        owner = msg.sender;
        rwd = _rwd;
        fakeTether = _fakeTether;
    }

    /* ========== MODIFIERS ========== */

    modifier updateReward(address _account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;

        rewards[_account] = earned(_account);
        userRewardPerTokenPaid[_account] = rewardPerTokenStored;

        _;
    }

    /* ========== VIEWS ========== */

    function rewardPerToken() public view returns (uint) {
        if (totalSupply == 0) {
            return rewardPerTokenStored;
        }

        return rewardPerTokenStored + (
            ( rewardRate * ( block.timestamp - lastUpdateTime ) * 1e18 ) / totalSupply // on multiplie par 1e18 pour eviter d'arrondir à 0 une trop faible valeur
        );
    }

    function earned(address _account) public view returns (uint) {
        return rewards[_account] + (
            balanceOf[_account] * ( rewardPerToken() - userRewardPerTokenPaid[_account] ) / 1e18
        );
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    function stake(uint _amount) external updateReward(msg.sender) {
        require(_amount > 0,"Deposit have to be greater than 0");
        //require(fakeTether.balanceOf(msg.sender) >= _amount,"Insufficiant funds"); // transferFrom already checks this

        balanceOf[msg.sender] += _amount;
        totalSupply += _amount;
        fakeTether.transferFrom(msg.sender,address(this),_amount);
        emit Stake(msg.sender, _amount);
    }

    function unstake() external updateReward(msg.sender) {
        require(balanceOf[msg.sender] > 0);

        uint amount = balanceOf[msg.sender];

        totalSupply -= amount;
        balanceOf[msg.sender] = 0;
        fakeTether.transfer(msg.sender,amount);
        emit Unstake(msg.sender, amount);
    }

    function getReward() external updateReward(msg.sender) {
        uint reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rwd.transfer(msg.sender, reward);
            emit GetReward(msg.sender, reward);
        }
    }

    function airDrop() external {
        uint tether = fakeTether.balanceOf(msg.sender);
        uint staked = balanceOf[msg.sender];
        require(tether + staked < 1000000000000000000000); // < 1000
        uint amount = 1000000000000000000000 - ( tether + staked );
        fakeTether.transferFrom(owner, msg.sender, amount);
        emit AirDrop(msg.sender, amount);
    }

}