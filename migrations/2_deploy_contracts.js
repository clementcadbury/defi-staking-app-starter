const Tether = artifacts.require('Tether');
const RWD = artifacts.require('RWD');
const DecentralBank = artifacts.require('DecentralBank');

module.exports = async function(deployer,network,accounts) {

    const prom1 = deployer.deploy(Tether);
    const prom2 =  deployer.deploy(RWD);

    await Promise.all([prom1,prom2]);

    const tether = await Tether.deployed();
    const rwd = await RWD.deployed();

    //await deployer.deploy(DecentralBank);
    await deployer.deploy(DecentralBank,rwd.address,tether.address);
    const decentralBank = await DecentralBank.deployed();

    await rwd.transfer( decentralBank.address, '1000000000000000000000000');

    await tether.transfer(accounts[1],'100000000000000000000');
};