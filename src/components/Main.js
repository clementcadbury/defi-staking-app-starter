import React, { Component } from 'react'

import tether from '../tether.png'

class Main extends Component {
    // react code goes here
    constructor(props) {
        super(props)
        this.state = {
            earned: '0',
        }
        this.stakeButton = React.createRef()
        this.unstakeButton = React.createRef()
        this.airdropButton = React.createRef()
        //this.earned = React.createRef()

        // pour que this dans la fonction enableAirdropButton soit le component Main
        // edit : inutile car on déclare la fonction enableAirdropButton en fléchée, elle est alors appelée comme une méthode et this est l'objet l'ayant créée
        //this.enableAirdropButton = this.enableAirdropButton.bind(this) 
    }

    componentDidUpdate() {
        //console.log('Main updated, loading ' + this.props.loading)
        this.setButtonsStatus()
    }
    componentDidMount() {
        //console.log('Main mounted, loading ' + this.props.loading)
        this.setButtonsStatus()
        this.updateEarned()
        setInterval(this.updateEarned,1000)
    }

    updateEarned = () => {
        if ( window.myWeb3 ) {
            const earned = window.myWeb3.utils.fromWei(this.props.earned,'Ether')
            const totalSupply = window.myWeb3.utils.fromWei(this.props.totalSupply,'Ether')
            const stakingBalance = window.myWeb3.utils.fromWei(this.props.stakingBalance,'Ether')
            const rewardRate = parseFloat( window.myWeb3.utils.fromWei(this.props.rewardRate,'Ether') )
            const myRewardRate = rewardRate * stakingBalance / totalSupply

            const myEarned = (parseFloat(earned) + myRewardRate * ( Date.now()/1000 - this.props.earnedTime )).toFixed(2)
            this.setState({earned: myEarned})
        }
    }

    setButtonsStatus = () => {
        let buttonState = this.props.loading === true
        //console.log(buttonState)
        this.stakeButton.current.disabled = buttonState
        this.unstakeButton.current.disabled = buttonState
        this.airdropButton.current.disabled = buttonState
    }

    render() {
        let stakingBalance = '0',rwdBalance = '0',tetherBalance = '0'/*, earned = '0'*/, rewardRate = '0', rewardRatePerDay = 0 , myRewardRatePerDay = 0 , myRewardRate = 0 , totalSupply = '0'
        if ( window.myWeb3 ) {
            stakingBalance = window.myWeb3.utils.fromWei(this.props.stakingBalance,'Ether')
            rwdBalance = window.myWeb3.utils.fromWei(this.props.rwdBalance,'Ether')
            tetherBalance = window.myWeb3.utils.fromWei(this.props.tetherBalance,'Ether')
            //earned = window.myWeb3.utils.fromWei(this.props.earned,'Ether')
            totalSupply = window.myWeb3.utils.fromWei(this.props.totalSupply,'Ether')
            rewardRate = parseFloat( window.myWeb3.utils.fromWei(this.props.rewardRate,'Ether') )
            rewardRatePerDay = Math.round(parseFloat( window.myWeb3.utils.fromWei(this.props.rewardRate,'Ether') ) * 3600 * 24 * 100 ) / 100
            myRewardRate = rewardRate * stakingBalance / totalSupply
            myRewardRatePerDay = Math.round( myRewardRate * 3600 * 24 * 100 ) / 100
        }
        return (
            <div id='content' className='mt-3'>
                <table className="table text-muted text-center">
                    <thead>
                        <tr style={{ color: 'white' }}>
                            <th scope="col">Staking Balance</th>
                            <th scope="col">Reward Balance</th>
                            <th scope="col">TVL</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ color: 'white' }}>
                            <td>{stakingBalance}&nbsp;USDT</td>
                            <td>{rwdBalance}&nbsp;RWD</td>
                            <td>{totalSupply}&nbsp;USDT</td>
                        </tr>
                    </tbody>
                </table>
                <div className='card mb-2' style={{ backgroundColor:'#fff' }}>
                <form 
                    onSubmit={(event) => {
                        event.preventDefault()
                        //console.log(this)
                        let amount = this.input.value.toString()
                        amount = window.myWeb3.utils.toWei(amount,'Ether')
                        this.props.stakeTokens(amount)
                        //return false
                    }} 
                    className='mb-3'>
                        <div style={{ borderSpacing: '0 1em' }} >
                            <label className='float-start' style={{ marginLeft: '15px' }}><b>Stake Tokens</b></label>
                            <span className='float-end' style={{ marginRight: '8px' }}>
                                Balance : {tetherBalance}
                            </span>
                            <div className='input-group mb-2'>
                                <input 
                                ref={(input) => {this.input = input}}
                                type='text' 
                                className='form-control' 
                                placeholder='0' 
                                required />
                                <span className='input-group-text'>
                                    <img alt='tether' src={tether} style={{ height: '32px' }} />
                                    &nbsp;USDT
                                </span>
                                <button ref={this.stakeButton} type='submit' className='btn btn-primary btn-lg' >{this.props.tetherAllowance !== '0' ? 'DEPOSIT' : 'ALLOW AND DEPOSIT'}</button>
                            </div>
                            <div>Reward for pool : {rewardRatePerDay} RWD / day</div>
                            <div>My reward : {myRewardRatePerDay} RWD / day</div>
                        </div>
                    </form>
                    <div className="d-grid gap-2">
                        <button 
                        ref={this.unstakeButton}
                        className='btn btn-primary btn-lg' 
                        onClick={(event) => {
                            event.preventDefault()
                            //console.log('unstake clicked')
                            this.props.unstakeTokens()
                        }}
                         >
                            UNSTAKE ALL
                        </button>
                        
                        <button ref={this.airdropButton} className='btn btn-primary btn-lg' >
                            COLLECT REWARD&nbsp;<span>{this.state.earned}&nbsp;RWD</span>
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

export default Main