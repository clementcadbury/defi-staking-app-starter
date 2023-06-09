import React from 'react'

import tether from '../tether.png'

class Main extends React.Component {
    // react code goes here
    constructor(props) {
        super(props)
        this.state = {
            earned: '0',
        }
        this.airDropButton = React.createRef()
        this.input = React.createRef()
        this.stakeButton = React.createRef()
        this.unstakeButton = React.createRef()
        this.rewardButton = React.createRef()
        //this.earned = React.createRef()

        // pour que this dans la fonction enableRewardButton soit le component Main
        // edit : inutile car on déclare la fonction enableRewardButton en fléchée, elle est alors appelée comme une méthode et this est l'objet l'ayant créée
        //this.enableRewardButton = this.enableRewardButton.bind(this) 
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
            const totalSupply = window.myWeb3.utils.fromWei(this.props.totalSupply,'Ether')
            const earned = window.myWeb3.utils.fromWei(this.props.earned,'Ether')
            
            const stakingBalance = window.myWeb3.utils.fromWei(this.props.stakingBalance,'Ether')
            const rewardRate = parseFloat( window.myWeb3.utils.fromWei(this.props.rewardRate,'Ether') )
            const myRewardRate = totalSupply>0 ? rewardRate * stakingBalance / totalSupply : 0

            const myEarned = parseFloat(earned) + myRewardRate * ( Date.now()/1000 - this.props.earnedTime )
            this.setState({earned: myEarned})
        }
    }

    setButtonsStatus = () => {
        let buttonState = this.props.loading === true || this.props.connecting === true

        if ( this.airDropButton.current ) this.airDropButton.current.disabled = buttonState
        this.input.current.disabled = buttonState
        this.stakeButton.current.disabled = buttonState
        this.unstakeButton.current.disabled = buttonState
        this.rewardButton.current.disabled = buttonState
    }

    render() {
        let stakingBalance = '0',rwdBalance = '0',fakeTetherBalance = '0'/*, earned = '0'*/, rewardRate = '0', rewardRatePerDay = 0 , myRewardRatePerDay = 0 , myRewardRate = 0 , totalSupply = '0'
        
        if ( window.myWeb3 ) {
            stakingBalance = window.myWeb3.utils.fromWei(this.props.stakingBalance,'Ether')
            rwdBalance = window.myWeb3.utils.fromWei(this.props.rwdBalance,'Ether')
            fakeTetherBalance = window.myWeb3.utils.fromWei(this.props.fakeTetherBalance,'Ether')
            //earned = window.myWeb3.utils.fromWei(this.props.earned,'Ether')
            totalSupply = window.myWeb3.utils.fromWei(this.props.totalSupply,'Ether')
            rewardRate = parseFloat( window.myWeb3.utils.fromWei(this.props.rewardRate,'Ether') )
            rewardRatePerDay = Math.round(parseFloat( window.myWeb3.utils.fromWei(this.props.rewardRate,'Ether') ) * 3600 * 24 * 100 ) / 100
            myRewardRate = totalSupply>0 ? rewardRate * stakingBalance / totalSupply : 0
            myRewardRatePerDay = Math.round( myRewardRate * 3600 * 24 * 100 ) / 100


        }
        let FUSDTBalanceSpan = parseFloat(fakeTetherBalance).toFixed(2)+' USDT'
        if ( parseFloat(stakingBalance) + parseFloat(fakeTetherBalance) < 1000 ) {
            //console.log('airDrop enabled')
            FUSDTBalanceSpan = 
                <button 
                    ref={this.airDropButton} 
                    type='button' 
                    title='request airDrop to 1000' 
                    className='btn btn-success btn-sm my-1' 
                    onClick={this.props.airDrop}
                >
                    {FUSDTBalanceSpan}
                </button>
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
                            <td>{parseFloat(stakingBalance).toFixed(2)}&nbsp;USDT</td>
                            <td>{parseFloat(rwdBalance).toFixed(2)}&nbsp;RWD</td>
                            <td>{parseFloat(totalSupply).toFixed(2)}&nbsp;USDT</td>
                        </tr>
                    </tbody>
                </table>
                <div className='card mb-2' style={{ backgroundColor:'#fff' }}>
                <form 
                    onSubmit={(event) => {
                        event.preventDefault()
                        //console.log(this)
                        let amount = this.input.current.value.toString()
                        amount = window.myWeb3.utils.toWei(amount,'Ether')
                        this.props.stakeTokens(amount)
                        this.input.current.value = ''
                        //return false
                    }} 
                    className='mb-3'>
                        <div style={{ borderSpacing: '0 1em' }} >
                            <label className='float-start' style={{ marginLeft: '15px' }}><b>Stake Tokens</b></label>
                            <span className='float-end' style={{ marginRight: '8px' }}>
                                Balance : {FUSDTBalanceSpan}
                            </span>
                            <div className='input-group mb-2'>
                                <input 
                                ref={this.input}
                                type='text' 
                                className='form-control' 
                                placeholder='0' 
                                required />
                                <span className='input-group-text'>
                                    <img alt='tether' src={tether} style={{ height: '32px' }} />
                                    &nbsp;USDT
                                </span>
                                <button ref={this.stakeButton} type='submit' className='btn btn-primary btn-lg' >{this.props.fakeTetherAllowance !== '0' ? 'DEPOSIT' : 'ALLOW AND DEPOSIT'}</button>
                            </div>
                            <div>Reward for pool : {parseFloat(rewardRatePerDay).toFixed(2)} RWD / day</div>
                            <div>My reward : {parseFloat(myRewardRatePerDay).toFixed(2)} RWD / day</div>
                        </div>
                    </form>
                    <div className="d-grid gap-2">
                        <button 
                        ref={this.unstakeButton}
                        className='btn btn-primary btn-lg' 
                        onClick={this.props.unstakeTokens}
                         >
                            UNSTAKE ALL
                        </button>
                        
                        <button 
                        ref={this.rewardButton} 
                        className='btn btn-primary btn-lg'
                        onClick={this.props.getReward}
                        >
                            COLLECT REWARD&nbsp;<span>{parseFloat(this.state.earned).toFixed(2)}&nbsp;RWD</span>
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

export default Main