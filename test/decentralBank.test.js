const FakeTether = artifacts.require('FakeTether');
const RWD = artifacts.require('RWD');
const DecentralBank = artifacts.require('DecentralBank');

require('chai')
.use(require('chai-as-promised'))
.should();

//contract('DecentralBank', accounts => {
contract('DecentralBank', ([owner,customer]) => {
    // testing code here

    let fakeTether, rwd, decentralBank;

    /*function tokens(n) {
        return web3.utils.toWei(n,'ether')
    }*/
    let tokens = n => web3.utils.toWei(n,'ether');

    before(async () => {
        // load contracts
        fakeTether = await FakeTether.new();
        rwd = await RWD.new();
        decentralBank = await DecentralBank.new(rwd.address,fakeTether.address);

        // transfer all reward tokens to decentralBank
        const ownerRWD = await rwd.balanceOf(owner);
        await rwd.transfer(decentralBank.address, ownerRWD);

        await fakeTether.approve(decentralBank.address,'1000000000000000000000000') // approve decentralBank to spend owners FakeTether for airdrop

        // transfer 100 Fake Tether to customer
        await fakeTether.transfer(customer,tokens('100'),{from:owner});
    });

    describe('Fake Tether Deployement',async () => {
        it('Correct name',async () => {
            const name = await fakeTether.name();
            assert.equal(name,'FakeTether');
        });
        it('Correct amounts',async () => {
            const ownerFakeTether = await fakeTether.balanceOf(owner);
            const customerFakeTether = await fakeTether.balanceOf(customer);

            assert.equal(ownerFakeTether , tokens((1000000-100).toString()));
            assert.equal(customerFakeTether , tokens('100'));
        });
    });
    

    describe('Reward Token Deployement',async () => {
        it('Correct name',async () => {
            const name = await rwd.name();
            assert.equal(name,'RewardToken');
        });
        it('Correct amounts',async () => {
            const ownerRwd = await rwd.balanceOf(owner);
            const customerRwd = await rwd.balanceOf(customer);

            assert.equal(ownerRwd , 0 , 'owner rwd balance should be 0 at this point');
            assert.equal(customerRwd , 0 , 'customer rwd balance should be 0 at this point');
        });
    });

    describe('DecentralBank Deployement',async () => {
        it('Correct name',async () => {
            const name = await decentralBank.name();
            assert.equal(name,'Decentral Bank');
        });
        it('Correct amounts',async () => {
            const bankFakeTether = await fakeTether.balanceOf(decentralBank.address);
            const bankRwd = await rwd.balanceOf(decentralBank.address);

            assert.equal(bankFakeTether , 0);
            assert.equal(bankRwd , tokens('1000000000') );
        });
    });

    describe('airDrop',async () => {
        it('Correct amount',async () => {
            await decentralBank.airDrop({from:customer})
            const customerFakeTether = await fakeTether.balanceOf(customer);

            assert.equal(customerFakeTether , tokens('1000') );
        });
    });

    describe('Yield farming', async() => {
        it('before allowance and staking',async() => {

            const customerAllowance = await fakeTether.allowance(customer,decentralBank.address);
            assert.equal(customerAllowance,0,'Start allowance should be zero');

            await decentralBank.stake(tokens('100'),{from:customer}).should.be.rejected;

            const cutomerStakingBalance = await decentralBank.balanceOf(customer);
            assert.equal(cutomerStakingBalance,0,'customer staking balance should be 0 tokens');

        });
        it('allowance and staking',async() => {

            //approve decentralBank to spend fake tether for customer
            await fakeTether.approve(decentralBank.address,tokens('1000'),{from: customer});

            customerAllowance = await fakeTether.allowance(customer,decentralBank.address);
            assert.equal(customerAllowance,tokens('1000'),'allowance should be 100 tokens');

            // call stake for cutomer
            await decentralBank.stake(tokens('1000'),{from:customer});

            const customerFakeTether = await fakeTether.balanceOf(customer);
            assert.equal(customerFakeTether,0,'customer fake tether balance should be zero after deposit');

            const decentralBankFakeTether = await fakeTether.balanceOf(decentralBank.address);
            assert.equal(decentralBankFakeTether,tokens('1000'),'decentralBank fake tether balance should be 100 tokens');

            const cutomerStakingBalance = await decentralBank.balanceOf(customer);
            assert.equal(cutomerStakingBalance,tokens('1000'),'customer staking balance should be 100 tokens');

        });

        /*it('reward issuing',async() => {

            await decentralBank.issueTokens({from:customer}).should.be.rejected;

            await decentralBank.issueTokens({from:owner});

            const customerRwd = await rwd.balanceOf(customer);
            assert.equal(customerRwd , tokens('10') ,'Customer should have 10 reward tokens');
        });*/

        it('unstake fake tether tokens',async() => {
            await decentralBank.unstake({from: customer});

            const customerFakeTether = await fakeTether.balanceOf(customer);
            assert.equal(customerFakeTether , tokens('1000'));

            const bankFakeTether = await fakeTether.balanceOf(decentralBank.address);
            assert.equal(bankFakeTether , 0);

            await decentralBank.unstake({from: customer}).should.be.rejected;

            const cutomerStakingBalance = await decentralBank.balanceOf(customer);
            assert.equal(cutomerStakingBalance,0,'customer staking balance should be 0 tokens');

        });
    });
});