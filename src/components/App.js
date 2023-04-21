import React, {Component} from 'react'
import './App.css'

import Navbar from './Navbar.js'
import Main from './Main.js'
import OwnerCard from './OwnerCard.js'
import TransferModal from './TransferModal.js'

import Web3 from 'web3'
import Tether from '../truffle_abis/Tether.json'
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
                this.setState({tether:{},rwd:{},decentralBank:{}})
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
            console.log(window.ethereum)
            console.log('isConnected ' + window.ethereum.isConnected())
            console.log('selectedAddress ' + window.ethereum.selectedAddress)

            if ( !window.myWeb3 ) { window.myWeb3 = new Web3(window.ethereum) }
            if ( window.ethereum.selectedAddress ) {
                console.log('Connected with ' + window.ethereum.selectedAddress)
                await this.connectProvider(false)
                this.setState({connecting:false})
            }
            this.setState({connecting:false})

        } else {
            console.log('Need metamask')
            this.setState({connecting:false})
        }
    }

    connectProvider = async (action=true) => { // if action == true, request connection, if == false, just return
        this.setState({connecting:true})

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
            } else if (error.code === -32603 ) {
                // You can make a request to add the chain to wallet here
                console.log('Chain hasn\'t been added to the wallet!')
                await this.addChain()
            } else {
                console.log('Error ' + error.code)
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
        let tether, rwd, decentralBank
        if ( !window.myWeb3 ) {
            return
        }
        const web3 = window.myWeb3
        const account = (await web3.eth.getAccounts())[0]
        //this.setState({account})
        //console.log(await web3.eth.getAccounts())
        const networkId = await web3.eth.net.getId()
        //console.log(networkId)

        // load Tether contract
        const tetherData = Tether.networks[networkId]
        if (tetherData){
            tether = new web3.eth.Contract(Tether.abi,tetherData.address)
            //this.setState({tether})
        } else {
            window.alert('Tether contract not found on network ' + networkId)
        }

        // load RWD reward token contract
        const rwdData = RWD.networks[networkId]
        if (rwdData){
            rwd = new web3.eth.Contract(RWD.abi,rwdData.address)
            //this.setState({rwd})
        } else {
            window.alert('Reward token RWD contract not found on network ' + networkId)
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
            window.alert('Decentral Bank contract not found on network ' + networkId)
        }

        /*if (decentralBankData && tetherData){
            const tetherAllowance = await this.state.tether.methods.allowance(this.state.account,decentralBankData.address).call()
            this.setState({tetherAllowance: tetherAllowance.toString() })
        }*/

        this.setState({
            account,
            tether,
            rwd,
            decentralBank,
        },
        async () => { 
            await this.updateBalances()
            this.setState({loading: false})
        })
    }

    updateBalances = async () => {
        if ( this.state.account !== '0x0' && this.state.tether.methods && this.state.rwd.methods && this.state.decentralBank.methods ) {
            const tetherBalance = await this.state.tether.methods.balanceOf(this.state.account).call()
            const rwdBalance = await this.state.rwd.methods.balanceOf(this.state.account).call()
            const stakingBalance = await this.state.decentralBank.methods.balanceOf(this.state.account).call()
            const tetherAllowance = await this.state.tether.methods.allowance(this.state.account,this.state.decentralBank._address).call()
            const earned = await this.state.decentralBank.methods.earned(this.state.account).call()
            const rewardRate = await this.state.decentralBank.methods.rewardRate().call()
            const totalSupply = await this.state.decentralBank.methods.totalSupply().call()

            const blockNumber = await window.myWeb3.eth.getBlockNumber()
            const timestamp = (await window.myWeb3.eth.getBlock(blockNumber)).timestamp

            this.setState({
                tetherBalance: tetherBalance.toString(),
                rwdBalance: rwdBalance.toString(),
                stakingBalance: stakingBalance.toString(),
                tetherAllowance: tetherAllowance.toString(),
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
        this.state.tether.methods.approve(this.state.decentralBank._address,amount).send({from: this.state.account}).on('transactionHash', (hash) => {
            this.state.decentralBank.methods.stake(amount).send({from: this.state.account}).on('transactionHash', (hash) => {
                this.setState({loading: false})
            })
        })
    }

    unstakeTokens = () => {
        this.setState({loading: true})
        this.state.decentralBank.methods.unstake().send({from: this.state.account}).on('transactionHash', (hash) => {
            this.setState({loading: false})
        })
    }

    getReward = () => {
        this.setState({loading: true})
        this.state.decentralBank.methods.getReward().send({from: this.state.account}).on('transactionHash', (hash) => {
            this.setState({loading: false})
        })
    }

    toggleTransferModal = () => {
        this.setState({ transferModal: !this.state.transferModal})
    }

    resetState() {
        this.setState({
            account: '0x0',
            tetherBalance: '0',
            rwdBalance: '0',
            stakingBalance: '0',
            tetherAllowance: '0',
            earned: '0',
            earnedTime: 0,
            rewardRate: '0',
            totalSupply: '0',
        })
    }

    constructor(props){
        super(props)
        this.state = {
            account: '0x0',
            tether: {},
            rwd: {},
            decentralBank: {},
            tetherBalance: '0',
            tetherAllowance: '0',
            rwdBalance: '0',
            stakingBalance: '0',
            earned: '0',
            earnedTime: 0,
            rewardRate: '0',
            totalSupply: '0',
            loading: true,
            connecting: true,
            transferModal: false,
        }
        this.owner = false

        this.chainId = '0x539'
    }

    render() {
        let content = 
            <Main 
                tether={this.state.tether}
                tetherBalance={this.state.tetherBalance}
                rwdBalance={this.state.rwdBalance}
                stakingBalance={this.state.stakingBalance}
                tetherAllowance={this.state.tetherAllowance}
                stakeTokens={this.stakeTokens}
                unstakeTokens={this.unstakeTokens}
                getReward={this.getReward}
                earned={this.state.earned}
                earnedTime={this.state.earnedTime}
                loading={this.state.loading}
                connecting={this.state.connecting}
                rewardRate={this.state.rewardRate}
                totalSupply={this.state.totalSupply}
            />
        
        let ownerCard = this.owner ?
            <OwnerCard 
                tether={this.state.tether}
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
                    tether={this.state.tether}
                    tetherBalance={this.state.tetherBalance}
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
            </div>
        )
    }
}

export default App
