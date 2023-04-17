import React, {Component} from 'react'
import './App.css'
import Navbar from './Navbar.js'
import Main from './Main.js'
import Web3 from 'web3'
import Tether from '../truffle_abis/Tether.json'
import RWD from '../truffle_abis/RWD.json'
import DecentralBank from '../truffle_abis/DecentralBank.json'
import OwnerCard from './OwnerCard.js'

class App extends Component {
    // react code goes here

    async UNSAFE_componentWillMount() {
        //await this.loadWeb3()
        //await this.loadBlockchainData()
    }

    async componentDidMount() {
        await this.loadWeb3()
        await this.loadBlockchainData()

        if (window.ethereum) {
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            })
            window.ethereum.on('accountsChanged', () => {
                window.location.reload();
            })
            setInterval(this.updateValues, 5000)
        }

        setInterval(this.updateBalances,5000)
    }

    async loadWeb3() {

        if ( window.ethereum ) {
            try {
                window.myWeb3 = new Web3(window.ethereum)
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                // connect successful
                //console.log('Metamask connect success')
            } catch (error) {
                if (error.code === 4001) {
                  // User rejected request
                  console.log('Error 4001 : Need to authorize Metamask')
                } else {
                    console.log('Error ' + error.code)
                }
            }
        } else {
            console.log('Need metamask')
        }
    }

    async loadBlockchainData() { 
        let tether, rwd, decentralBank
        if ( !window.myWeb3 ) {
            return
        }
        const web3 = window.myWeb3
        const account = (await web3.eth.getAccounts())[0]
        //this.setState({account})
        //console.log(account)
        const networkId = await web3.eth.net.getId()
        //console.log(networkId)

        // load Tether contract
        const tetherData = Tether.networks[networkId]
        if (tetherData){
            tether = new web3.eth.Contract(Tether.abi,tetherData.address)
            //this.setState({tether})
            //let tetherBalance = await tether.methods.balanceOf(this.state.account).call()
            //this.setState({tetherBalance: tetherBalance.toString() })
            //console.log({tetherBalance: tetherBalance})
        } else {
            window.alert('Tether contract not found on network ' + networkId)
        }

        // load RWD reward token contract
        const rwdData = RWD.networks[networkId]
        if (rwdData){
            rwd = new web3.eth.Contract(RWD.abi,rwdData.address)
            //this.setState({rwd})
            //let rwdBalance = await rwd.methods.balanceOf(this.state.account).call()
            //this.setState({rwdBalance: rwdBalance.toString() })
            //console.log({rwdBalance: rwdBalance})
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
            }
            //this.setState({decentralBank})
            //const stakingBalance = await decentralBank.methods.balanceOf(this.state.account).call()
            //this.setState({stakingBalance: stakingBalance.toString() })
            //console.log({stakingBalance: stakingBalance})
        } else {
            window.alert('Decentral Bank contract not found on network ' + networkId)
        }

        if (decentralBankData && tetherData){
            //const tetherAllowance = await this.state.tether.methods.allowance(this.state.account,decentralBankData.address).call()
            //this.setState({tetherAllowance: tetherAllowance.toString() })
        }

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
        if ( this.state.tether.methods && this.state.rwd.methods && this.state.decentralBank.methods ) {
            const tetherBalance = await this.state.tether.methods.balanceOf(this.state.account).call()
            const rwdBalance = await this.state.rwd.methods.balanceOf(this.state.account).call()
            const stakingBalance = await this.state.decentralBank.methods.balanceOf(this.state.account).call()
            const tetherAllowance = await this.state.tether.methods.allowance(this.state.account,this.state.decentralBank._address).call()
            const earned = await this.state.decentralBank.methods.earned(this.state.account).call()
            const rewardPerToken = await this.state.decentralBank.methods.rewardPerToken().call()
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
                rewardPerToken: rewardPerToken.toString(),
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
            //rewardPerToken: '0',
            rewardRate: '0',
            totalSupply: '0',
            loading: true
        }
        this.owner = false
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
                earned={this.state.earned}
                earnedTime={this.state.earnedTime}
                loading={this.state.loading}
                rewardRate={this.state.rewardRate}
                totalSupply={this.state.totalSupply}
            />
        
        let ownerCard = this.owner ?
            <OwnerCard 
                tether={this.state.tether }
                decentralBank={this.state.decentralBank}
                rwd={this.state.rwd}
            />
            :
            ''

        return (
            <div className='App' style={{position:'relative',backgroundColor:'#01113d'}}>
                <Navbar 
                    account={this.state.account}
                    owner={this.owner} 
                />
                {ownerCard}
                <div className='container-fluid mt-5' >
                    <div className='row'>
                        <main role='main' className='col-lg-12 mx-auto' style={{maxWidth:'600px',minHeight:'100vh'}}>
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
