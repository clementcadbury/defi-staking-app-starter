const Tether = artifacts.require('Tether');
const RWD = artifacts.require('RWD');
const DecentralBank = artifacts.require('DecentralBank');

require('chai')
.use(require('chai-as-promised'))
.should();

//contract('DecentralBank', accounts => {
contract('DecentralBank', ([owner,customer]) => {
    // testing code here

    let tether, rwd, decentralBank;

    /*function tokens(n) {
        return web3.utils.toWei(n,'ether')
    }*/
    let tokens = n => web3.utils.toWei(n,'ether');

    before(async () => {
        // load contracts
        tether = await Tether.new();
        rwd = await RWD.new();
        decentralBank = await DecentralBank.new(rwd.address,tether.address);

        // transfer all reward tokens to decentralBank (1 million)
        await rwd.transfer(decentralBank.address, tokens('1000000000'));

        // transfer 100 Fake Tether to customer
        await tether.transfer(customer,tokens('100'),{from:owner});
    });

    describe('Fake Tether Deployement',async () => {
        it('Correct name',async () => {
            const name = await tether.name();
            assert.equal(name,'FakeTether');
        });
        it('Correct amounts',async () => {
            const ownerTether = await tether.balanceOf(owner);
            const customerTether = await tether.balanceOf(customer);

            assert.equal(ownerTether , tokens((1000000-100).toString()));
            assert.equal(customerTether , tokens('100'));
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
            const bankTether = await tether.balanceOf(decentralBank.address);
            const bankRwd = await rwd.balanceOf(decentralBank.address);

            assert.equal(bankTether , 0);
            assert.equal(bankRwd , tokens('1000000000') );
        });
    });

    describe('Yield farming', async() => {
        it('before allowance and staking',async() => {

            const customerAllowance = await tether.allowance(customer,decentralBank.address);
            assert.equal(customerAllowance,0,'Start allowance should be zero');

            await decentralBank.stake(tokens('100'),{from:customer}).should.be.rejected;

            const cutomerStakingBalance = await decentralBank.balanceOf(customer);
            assert.equal(cutomerStakingBalance,0,'customer staking balance should be 0 tokens');

        });
        it('allowance and staking',async() => {

            //approve decentralBank to spend tether for customer
            await tether.approve(decentralBank.address,tokens('100'),{from: customer});

            customerAllowance = await tether.allowance(customer,decentralBank.address);
            assert.equal(customerAllowance,tokens('100'),'allowance should be 100 tokens');

            // call stake for cutomer
            await decentralBank.stake(tokens('100'),{from:customer});

            const customerTether = await tether.balanceOf(customer);
            assert.equal(customerTether,0,'customer tether balance should be zero after deposit');

            const decentralBankTether = await tether.balanceOf(decentralBank.address);
            assert.equal(decentralBankTether,tokens('100'),'decentralBank tether balance should be 100 tokens');

            const cutomerStakingBalance = await decentralBank.balanceOf(customer);
            assert.equal(cutomerStakingBalance,tokens('100'),'customer staking balance should be 100 tokens');

        });

        /*it('reward issuing',async() => {

            await decentralBank.issueTokens({from:customer}).should.be.rejected;

            await decentralBank.issueTokens({from:owner});

            const customerRwd = await rwd.balanceOf(customer);
            assert.equal(customerRwd , tokens('10') ,'Customer should have 10 reward tokens');
        });*/

        it('unstake tether tokens',async() => {
            await decentralBank.unstake({from: customer});

            const customerTether = await tether.balanceOf(customer);
            assert.equal(customerTether , tokens('100'));

            const bankTether = await tether.balanceOf(decentralBank.address);
            assert.equal(bankTether , 0);

            await decentralBank.unstake({from: customer}).should.be.rejected;

            const cutomerStakingBalance = await decentralBank.balanceOf(customer);
            assert.equal(cutomerStakingBalance,0,'customer staking balance should be 0 tokens');

        });
    });
});