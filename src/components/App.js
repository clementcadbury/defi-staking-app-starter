import React, {Component} from 'react'
import './App.css'

import Navbar from './Navbar.js'
import Main from './Main.js'
import OwnerCard from './OwnerCard.js'
import TransferModal from './TransferModal.js'
import AppAlert from './AppAlert.js'

import Web3 from 'web3'
import FakeTether from '../truffle_abis/FakeTether.json'
import RWD from '../truffle_abis/RWD.json'
import DecentralBank from '../truffle_abis/DecentralBank.json'


class App extends Component {

    async UNSAFE_componentWillMount() {}

    async componentDidMount() {
        await this.loadWeb3()
        //await this.loadBlockchainData()

        if (window.ethereum) {
            window.ethereum.on('chainChanged', () => {
                console.log('*** Metamask chainChanged event')
                this.setState({account: '0x0',loading:true})
                this.setState({fakeTether:{},rwd:{},decentralBank:{}})
                this.resetState()
                this.loadWeb3()
                //window.location.reload();
            })
            window.ethereum.on('accountsChanged', () => {
                console.log('*** Metamask accountsChanged event')
                this.setState({account: '0x0',loading:true})
                this.resetState()
                this.loadWeb3()
                //window.location.reload();
            })
            window.ethereum.on('connect', () => {
                console.log('*** Metamask connect event')
                this.setState({account: '0x0',loading:true})
                this.resetState()
                this.loadWeb3()
            })
        }

        setInterval(this.updateBalances,5000)
    }

    async componentDidUpdate() {

    }

    async loadWeb3() {

        if ( window.ethereum && window.ethereum.isConnected() ) {
            //await window.ethereum.enable()
            //console.log(window.ethereum)
            console.log('isConnected ' + window.ethereum.isConnected())
            console.log('selectedAddress ' + window.ethereum.selectedAddress)

            if ( !window.myWeb3 ) { window.myWeb3 = new Web3(window.ethereum) }
            if ( window.ethereum.selectedAddress ) {
                console.log('Connected with ' + window.ethereum.selectedAddress)
                await this.connectProvider(false)
                //this.setState({connecting:false})
            }
            this.setState({connecting:false})

        } else {
            console.log('Need metamask 01')
            //this.showAlertAction(true,'Need Metamask','You need metamask or another compatible browser wallet for this application to run')
            this.setState({connecting:false})
        }
    }

    connectProvider = async (action=true) => { // if action == true, request connection, if == false, just return
        this.setState({connecting:true})

        if ( !window.ethereum) {
            console.log('Need metamask 02')
            this.showAlertAction(true,'Need Metamask','You need metamask or another compatible browser wallet for this application to run')
            return
        }

        const chainId = await window.ethereum.request({ method: 'eth_chainId' })

        if ( !action && ( !window.ethereum.selectedAddress || chainId !== this.chainId ) ) {
            console.log('Not allowed or wrong chain')
            return
        }


        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            // connect successful
            console.log('Metamask/provider connect success')
            await this.chooseChain()
            console.log('Metamask/provider chainId ok')
            await this.loadBlockchainData()
            console.log('Metamask/provider initial data loaded')
        } catch (error) {
            if (error.code === 4001) {
                // User rejected request
                console.log('Error 4001 : Need to authorize Metamask to correct chain')
                this.showAlertAction(true,'Please Autorize Metamask','You need to authorize Metamask for this application to run')
            } else if (error.code === -32603 ) {
                // You can make a request to add the chain to wallet here
                console.log('Chain hasn\'t been added to the wallet!')
                try {
                    await this.addChain()
                } catch (error) {
                    console.log('Couldnt add chain, code ' + error.code + ' : ' + error.message)
                    this.showAlertAction(true,'Incorrect chain','Metamask needs to be on the correct chain for this application to run')
                }
            } else {
                console.log('Error ' + error.code)
                this.showAlertAction(true,'Unknown error','Please make sure Metamask is installed and authorized on the right chain')
            }
        }

        this.setState({connecting:false})
    }

    async chooseChain() {
        if ( window.ethereum.selectedAddress ) {
            //const chainId = await window.ethereum.request({ method: 'eth_chainId' })
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: this.chainId }],
            });
        }
    }

    async addChain() {
        await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: "0x539",
              rpcUrls: ["HTTP://127.0.0.1:7545"],
              chainName: "Ganache local test",
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18
              },
              //blockExplorerUrls: ["https://polygonscan.com/"]
            }]
        })
    }

    async loadBlockchainData() { 
        let fakeTether, rwd, decentralBank
        if ( !window.myWeb3 ) {
            return
        }
        const web3 = window.myWeb3
        const account = (await web3.eth.getAccounts())[0]
        //this.setState({account})
        //console.log(await web3.eth.getAccounts())
        const networkId = await web3.eth.net.getId()
        //console.log(networkId)

        // load FakeTether contract
        const fakeTetherData = FakeTether.networks[networkId]
        if (fakeTetherData){
            fakeTether = new web3.eth.Contract(FakeTether.abi,fakeTetherData.address)
            //this.setState({fakeTether})
        } else {
            console.log('FakeTether contract not found on network ' + networkId)
            this.showAlertAction(true,'Error finding FakeTether contract','FakeTether contract could not be found on this chain')
        }

        // load RWD reward token contract
        const rwdData = RWD.networks[networkId]
        if (rwdData){
            rwd = new web3.eth.Contract(RWD.abi,rwdData.address)
            //this.setState({rwd})
        } else {
            console.log('Reward token RWD contract not found on network ' + networkId)
            this.showAlertAction(true,'Error finding RWD contract','RWD token contract could not be found on this chain')
        }

        // load Decentral Bank contract
        const decentralBankData = DecentralBank.networks[networkId]
        if (decentralBankData){
            decentralBank = new web3.eth.Contract(DecentralBank.abi,decentralBankData.address)
            const owner = await decentralBank.methods.owner().call()
            if ( owner === account ) {
                this.owner = true
            } else {
                this.owner = false
            }
            //this.setState({decentralBank})
        } else {
            console.log('Decentral Bank contract not found on network ' + networkId)
            this.showAlertAction(true,'Error finding DecentralBank contract','DecentralBank contract could not be found on this chain')
        }

        /*if (decentralBankData && fakeTetherData){
            const fakeTetherAllowance = await this.state.fakeTether.methods.allowance(this.state.account,decentralBankData.address).call()
            this.setState({fakeTetherAllowance: fakeTetherAllowance.toString() })
        }*/

        this.setState({
            account,
            fakeTether,
            rwd,
            decentralBank,
        },
        async () => { 
            await this.updateBalances()
            await this.testEvents()
            this.setState({loading: false})
        })
    }

    testEvents = async () => {
        /*this.state.decentralBank.getPastEvents("AirDrop",{ fromBlock:0 }).then(event => {
            console.log(event)
        });*/
    }

    updateBalances = async () => {
        if ( this.state.account !== '0x0' && this.state.fakeTether.methods && this.state.rwd.methods && this.state.decentralBank.methods ) {
            const fakeTetherBalance = await this.state.fakeTether.methods.balanceOf(this.state.account).call()
            const rwdBalance = await this.state.rwd.methods.balanceOf(this.state.account).call()
            const stakingBalance = await this.state.decentralBank.methods.balanceOf(this.state.account).call()
            const fakeTetherAllowance = await this.state.fakeTether.methods.allowance(this.state.account,this.state.decentralBank._address).call()
            const earned = await this.state.decentralBank.methods.earned(this.state.account).call()
            const rewardRate = await this.state.decentralBank.methods.rewardRate().call()
            const totalSupply = await this.state.decentralBank.methods.totalSupply().call()

            const blockNumber = await window.myWeb3.eth.getBlockNumber()
            const timestamp = (await window.myWeb3.eth.getBlock(blockNumber)).timestamp

            this.setState({
                fakeTetherBalance: fakeTetherBalance.toString(),
                rwdBalance: rwdBalance.toString(),
                stakingBalance: stakingBalance.toString(),
                fakeTetherAllowance: fakeTetherAllowance.toString(),
                earned: earned.toString(),
                earnedTime: timestamp,
                rewardRate: rewardRate.toString(),
                totalSupply: totalSupply.toString(),
            })
            //console.log('Balances reloaded in App')
        }
    }

    stakeTokens = (amount) => {
        this.setState({loading: true})
        
        this.state.fakeTether.methods.approve(this.state.decentralBank._address,amount).send({from: this.state.account})
        .on('transactionHash', (hash) => {
            this.state.decentralBank.methods.stake(amount).send({from: this.state.account})
            .on('transactionHash', (hash) => {
                this.setState({loading: false})
            })
            .catch( (error) => {
                if ( error.code === 4001 ) {
                    this.showAlertAction(true,'Transaction rejected','Please accept the transaction for approval, then staking')
                } else {
                    this.showAlertAction(true,'Transaction rejected','Something went wrong, please try again')
                }
                this.setState({loading: false})
            })
        })
        .catch( (error) => {
            if ( error.code === 4001 ) {
                this.showAlertAction(true,'Transaction rejected','Please accept the transaction for approval, then staking')
            } else {
                this.showAlertAction(true,'Transaction rejected','Something went wrong, please try again')
            }
            this.setState({loading: false})
        })
    }

    unstakeTokens = () => {
        this.setState({loading: true})
        this.state.decentralBank.methods.unstake().send({from: this.state.account})
        .on('transactionHash', (hash) => {
            this.setState({loading: false})
        })
        .catch( (error) => {
            if ( error.code === 4001 ) {
                this.showAlertAction(true,'Transaction rejected','Please accept the transaction for unstaking')
            } else {
                this.showAlertAction(true,'Transaction rejected','Something went wrong, please try again')
            }
            this.setState({loading: false})
        })
    }

    getReward = () => {
        this.setState({loading: true})
        this.state.decentralBank.methods.getReward().send({from: this.state.account})
        .on('transactionHash', (hash) => {
            this.setState({loading: false})
        })
        .catch( (error) => {
            if ( error.code === 4001 ) {
                this.showAlertAction(true,'Transaction rejected','Please accept the transaction to get reward')
            } else {
                this.showAlertAction(true,'Transaction rejected','Something went wrong, please try again')
            }
            this.setState({loading: false})
        })
    }

    airDrop = () => {
        this.setState({loading: true})
        this.state.decentralBank.methods.airDrop().send({from: this.state.account})
        .on('transactionHash', (hash) => {
            this.setState({loading: false})
        })
        .catch( (error) => {
            if ( error.code === 4001 ) {
                this.showAlertAction(true,'Transaction rejected','Please accept the transaction to get airdrop')
            } else {
                this.showAlertAction(true,'Transaction rejected','Something went wrong, please try again')
            }
            this.setState({loading: false})
        })
    }

    toggleTransferModal = () => {
        this.setState({ transferModal: !this.state.transferModal})
    }

    showAlertAction = (show,title='',text='') => {
        this.setState({
            showAlert:show,
            alertTitle: title,
            alertText: text,
        })
    }

    resetState() {
        this.owner = false
        this.setState({
            account: '0x0',
            fakeTetherBalance: '0',
            rwdBalance: '0',
            stakingBalance: '0',
            fakeTetherAllowance: '0',
            earned: '0',
            earnedTime: 0,
            rewardRate: '0',
            totalSupply: '0',
            showAlert: false,
        })
    }

    constructor(props){
        super(props)
        this.state = {
            account: '0x0',
            fakeTether: {},
            rwd: {},
            decentralBank: {},
            fakeTetherBalance: '0',
            fakeTetherAllowance: '0',
            rwdBalance: '0',
            stakingBalance: '0',
            earned: '0',
            earnedTime: 0,
            rewardRate: '0',
            totalSupply: '0',
            loading: true,
            connecting: true,
            transferModal: false,
            showAlert: false,
            alertTitle: '',
            alertText: '',
        }
        this.owner = false

        this.chainId = '0x539'
    }

    render() {
        let content = 
            <Main 
                fakeTether={this.state.fakeTether}
                fakeTetherBalance={this.state.fakeTetherBalance}
                rwdBalance={this.state.rwdBalance}
                stakingBalance={this.state.stakingBalance}
                fakeTetherAllowance={this.state.fakeTetherAllowance}
                stakeTokens={this.stakeTokens}
                unstakeTokens={this.unstakeTokens}
                getReward={this.getReward}
                earned={this.state.earned}
                earnedTime={this.state.earnedTime}
                loading={this.state.loading}
                connecting={this.state.connecting}
                rewardRate={this.state.rewardRate}
                totalSupply={this.state.totalSupply}
                airDrop={this.airDrop}
            />
        
        let ownerCard = this.owner ?
            <OwnerCard 
                fakeTether={this.state.fakeTether}
                decentralBank={this.state.decentralBank}
                rwd={this.state.rwd}
                //account={this.state.account}
            />
            :
            ''

        return (
            <div className='App' style={{position:'relative',backgroundColor:'#01113d'}}>
                <TransferModal 
                    show={this.state.transferModal} 
                    toggleTransferModal={this.toggleTransferModal}
                    fakeTether={this.state.fakeTether}
                    fakeTetherBalance={this.state.fakeTetherBalance}
                    account={this.state.account}
                />
                <Navbar 
                    account={this.state.account}
                    connecting={this.state.connecting}
                    loading={this.state.loading}
                    owner={this.owner}
                    toggleTransferModal={this.toggleTransferModal}
                    connectProvider={this.connectProvider}
                />
                
                {ownerCard}
                <div className='container-fluid pt-5' style={{minHeight: '100vh'}} >
                    <div className='row'>
                        <main role='main' className='col-lg-12 mx-auto' style={{maxWidth:'600px'}}>
                            
                            <div>
                                {content}
                            </div>
                        </main>
                    </div>
                </div>
                <AppAlert showAlert={this.state.showAlert} showAlertAction={this.showAlertAction} alertTitle={this.state.alertTitle} alertText={this.state.alertText} />
            </div>
        )
    }
}

export default App
