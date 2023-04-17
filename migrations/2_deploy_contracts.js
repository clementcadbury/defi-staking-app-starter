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

    const ownerRWD = await rwd.balanceOf(accounts[0]);

    await rwd.transfer( decentralBank.address, ownerRWD); // 1 000 000

    await tether.transfer(accounts[1],'1000000000000000000000'); // 1000
    await tether.transfer(accounts[2],'1000000000000000000000'); // 1000
    await tether.transfer(accounts[3],'1000000000000000000000'); // 1000
};