const DecentralBank = artifacts.require('DecentralBank');

module.exports = async function issueReward(callback) {
    let decentralBank = await DecentralBank.deployed();
    await decentralBank.issueTokens();
    console.log('Tokens have been issued successfuly');
    callback();
}