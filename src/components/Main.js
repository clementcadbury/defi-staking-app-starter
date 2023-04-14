import React, { Component } from 'react'
import Airdrop from './Airdrop.js'

import tether from '../tether.png'

class Main extends Component {
    // react code goes here
    constructor(props) {
        super(props)
        this.airdropButton = React.createRef()

        // pour que this dans la fonction enableAirdropButton soit le component Main
        // edit : inutile car on déclare la fonction enableAirdropButton en fléchée, elle est alors appelée comme une méthode et this est l'objet l'ayant créée
        //this.enableAirdropButton = this.enableAirdropButton.bind(this) 
    }

    enableAirdropButton = () => {
        //console.log(this)
        this.airdropButton.current.disabled = false
    }

    render() {
        return (
            <div id='content' className='mt-3'>
                <table className="table text-muted text-center">
                    <thead>
                        <tr style={{ color: 'white' }}>
                            <th scope="col">Staking Balance</th>
                            <th scope="col">Reward Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ color: 'white' }}>
                            <td>{window.web3.utils.fromWei(this.props.stakingBalance,'Ether')}&nbsp;USDT</td>
                            <td>{window.web3.utils.fromWei(this.props.rwdBalance,'Ether')}&nbsp;RWD</td>
                        </tr>
                    </tbody>
                </table>
                <div className='card mb-2' style={{ backgroundColor:'#fff' }}>
                <form 
                    onSubmit={(event) => {
                        event.preventDefault()
                        //console.log(this)
                        let amount = this.input.value.toString()
                        amount = window.web3.utils.toWei(amount,'Ether')
                        this.props.stakeTokens(amount)
                        //return false
                    }} 
                    className='mb-3'>
                        <div style={{ borderSpacing: '0 1em' }} >
                            <label className='float-start' style={{ marginLeft: '15px' }}><b>Stake Tokens</b></label>
                            <span className='float-end' style={{ marginRight: '8px' }}>
                                Balance : {window.web3.utils.fromWei(this.props.tetherBalance,'Ether')}
                            </span>
                            <div className='input-group mb-4'>
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
                            </div>
                            <div className="d-grid"><button type='submit' className='btn btn-primary btn-lg'>{this.props.tetherAllowance !== '0' ? 'DEPOSIT' : 'ALLOW AND DEPOSIT'}</button></div>
                        </div>
                    </form>
                    <div className="d-grid gap-2">
                        <button 
                        className='btn btn-primary btn-lg' 
                        onClick={(event) => {event.preventDefault()
                            this.props.unstakeTokens()
                        }}>
                            WITHDRAW
                        </button>
                        
                        <button ref={this.airdropButton} className='btn btn-primary btn-lg' disabled>
                            AIRDROP&nbsp;
                            <Airdrop 
                                stakingBalance={this.props.stakingBalance}
                                enableAirdropButton={this.enableAirdropButton}
                            />
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

export default Main