import React, {Component} from 'react'
import './App.css'
import Navbar from './Navbar.js'
import Web3 from 'web3'

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
    }

    constructor(props){
        super(props)
        this.state = {
            account: '0x0',
            tether: {},
            rwd: {},
            decentralizedBank: {},
            tetherBalance: '0',
            rwdBalance: '0',
            stakingBalance: '0',
            loading: true
        }
    }

    render() {
        return (
            <div>
                <Navbar account={this.state.account} />
                <div className='text-center green'>
                    <h1>Hello World!</h1>
                </div>
            </div>
        )
    }
}

export default App
