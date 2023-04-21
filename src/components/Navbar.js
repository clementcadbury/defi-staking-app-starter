import React, { PureComponent } from 'react'
import bank from '../bank.png'

class Navbar extends PureComponent {

    render() {
        //console.log('Navbar Render')
        const ownerStr = this.props.owner ? ' (owner)' : ''

        let accountSpan = <button type="button" className="btn btn-primary btn-sm" disabled>Connect</button>

        
        if ( this.props.account !== '0x0') {
            if ( this.props.loading ) {
                accountSpan = <small style={{ color: 'white' }} >ACCOUNT NUMBER : {this.props.account}{ownerStr}</small>
            } else {
                accountSpan = <small style={{ color: 'white' }} onClick={this.props.toggleTransferModal} role='button'>ACCOUNT NUMBER : {this.props.account}{ownerStr}</small>
            }
        } else if ( !this.props.connecting ){
            accountSpan = accountSpan = <button type="button" className="btn btn-primary btn-sm" onClick={this.props.connectProvider}>Connect</button>
        }

        return (
            <nav className='navbar navbar-dark fixed-top shadow p-0' style={{ backgroundColor: 'black', height: '50px' }}>

                <a className='navbar-brand col-sm-3 col-md-2 ms-3'
                    style={{}}
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