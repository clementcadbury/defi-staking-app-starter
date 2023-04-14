import React, {Component} from 'react'
import './App.css'
import Navbar from './Navbar.js'
import Main from './Main.js'
import Web3 from 'web3'
import Tether from '../truffle_abis/Tether.json'
import RWD from '../truffle_abis/RWD.json'
import DecentralBank from '../truffle_abis/DecentralBank.json'

class App extends Component {
    // react code goes here

    async UNSAFE_componentWillMount() {
        await this.loadWeb3()
        await this.loadBlockchainData()
    }

    async loadWeb3() {

        if ( window.ethereum ) {
            try {
                window.web3 = new Web3(window.ethereum)
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                // connect successful
            } catch (error) {
                if (error.code === 4001) {
                  // User rejected request
                  //window.alert('Need to authorize Metamask')
                }
            }
        } else {
            //window.alert('Need metamask')
        }
    }

    async loadBlockchainData() { 
        const web3 = window.web3
        const account = (await web3.eth.getAccounts())[0]
        this.setState({account:account})
        //console.log(account)
        const networkId = await web3.eth.net.getId()
        //console.log(networkId)

        // load Tether contract
        const tetherData = Tether.networks[networkId]
        if (tetherData){
            const tether = new web3.eth.Contract(Tether.abi,tetherData.address)
            this.setState({tether})
            let tetherBalance = await tether.methods.balanceOf(this.state.account).call()
            this.setState({tetherBalance: tetherBalance.toString() })
            //console.log({tetherBalance: tetherBalance})
        } else {
            window.alert('Tether contract not found on network ' + networkId)
        }

        // load RWD reward token contract
        const rwdData = RWD.networks[networkId]
        if (rwdData){
            const rwd = new web3.eth.Contract(RWD.abi,rwdData.address)
            this.setState({rwd})
            let rwdBalance = await rwd.methods.balanceOf(this.state.account).call()
            this.setState({rwdBalance: rwdBalance.toString() })
            //console.log({rwdBalance: rwdBalance})
        } else {
            window.alert('Reward token RWD contract not found on network ' + networkId)
        }

        // load Decentral Bank contract
        const decentralBankData = DecentralBank.networks[networkId]
        if (decentralBankData){
            const decentralBank = new web3.eth.Contract(DecentralBank.abi,decentralBankData.address)
            this.setState({decentralBank})
            const stakingBalance = await decentralBank.methods.stakingBalance(this.state.account).call()
            this.setState({stakingBalance: stakingBalance.toString() })
            //console.log({stakingBalance: stakingBalance})
        } else {
            window.alert('Decentral Bank contract not found on network ' + networkId)
        }

        if (decentralBankData && tetherData){
            const tetherAllowance = await this.state.tether.methods.allowance(this.state.account,decentralBankData.address).call()
            this.setState({tetherAllowance: tetherAllowance.toString() })
        }

        this.setState({loading: false})
    }

    async balances() {
        
    }

    stakeTokens = (amount) => {
        this.setState({loading: true})
        this.state.tether.methods.approve(this.state.decentralBank._address,amount).send({from: this.state.account}).on('transactionHash', (hash) => {
            this.state.decentralBank.methods.depositTokens(amount).send({from: this.state.account}).on('transactionHash', (hash) => {
                this.setState({loading: false})
            })
        })
    }

    unstakeTokens = () => {
        this.setState({loading: true})
        this.state.decentralBank.methods.unstakeTokens().send({from: this.state.account}).on('transactionHash', (hash) => {
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
            loading: true
        }
    }

    render() {
        let content = this.state.loading ? 
            <p id='loader' className='text-center' style={{margin:'30px'}}>LOADING PLEASE...</p>
            :
            <Main 
                tetherBalance={this.state.tetherBalance}
                rwdBalance={this.state.rwdBalance}
                stakingBalance={this.state.stakingBalance}
                tetherAllowance={this.state.tetherAllowance}
                stakeTokens={this.stakeTokens}
                unstakeTokens={this.unstakeTokens}
            />
        
        return (
            <div className='App' style={{position:'relative',backgroundColor:'#01113d'}}>
                <Navbar account={this.state.account} />
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
