import React, { PureComponent } from 'react'
import bank from '../bank.png'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './Navbar.css'

class Navbar extends PureComponent {

    render() {
        //console.log('Navbar Render')
        const ownerStr = this.props.owner ? ' (owner)' : ''

        let accountSpan = <button type="button" className="btn btn-primary btn-sm" disabled>Connect</button>

        const sendIcon = <i className="bi bi-arrow-down-up mx-2 sendIcon" role='button' title='Transfer tokens' onClick={this.props.toggleTransferModal} ></i>
        
        if ( this.props.account !== '0x0') {
            if ( this.props.loading ) {
                accountSpan = <small style={{ color: 'white' }} >ACCOUNT NUMBER : {this.props.account}{ownerStr}</small>
            } else {
                accountSpan = <small style={{ color: 'white' }} >ACCOUNT NUMBER : {this.props.account}{ownerStr} {sendIcon}</small>
            }
        } else if ( !this.props.connecting ){
            accountSpan = accountSpan = <button type="button" className="btn btn-primary btn-sm" onClick={this.props.connectProvider}>Connect</button>
        }

        return (
            <nav className='navbar navbar-dark fixed-top shadow p-0' style={{ backgroundColor: 'black', height: '50px' }}>

                <a className='navbar-brand col-sm-3 col-md-2 ms-3'
                    href="/">
                    <img src={bank} width='50px' height='30px' className='d-inline-block align-top me-1' alt='logo' />
                    DApp Yield Staking (Decentralized Banking)
                </a>
                <ul className='navbar-nav px-3'>
                    <li className='text-nowrap d-none nav-item d-sm-block'>
                        {accountSpan}
                    </li>
                </ul>
            </nav>
        )
    }
}

export default Navbar