import React, {Component} from 'react'
import bank from '../bank.png'

//import './Navbar.css'

class Navbar extends Component {
    // react code goes here
    render() {
//function Navbar(props){
        const ownerStr = this.props.owner ? ' (owner)' : ''
        return (
            <nav className='navbar navbar-dark fixed-top shadow p-0' style={{backgroundColor:'black', height:'50px' }}>
                <a className='navbar-brand col-sm-3 col-md-2 ms-3'
                style={{}}
                href="/">
                    <img src={bank} width='50px' height='30px' className='d-inline-block align-top me-1' alt='logo' />
                    DApp Yield Staking (Decentralized Banking)
                </a>
                <ul className='navbar-nav px-3'>
                    <li className='text-nowrap d-none nav-item d-sm-block'>
                        <small style={{color:'white'}}>ACCOUNT NUMBER : {this.props.account}{ownerStr}</small>
                    </li>
                </ul>
            </nav>
        )
    }
}

export default Navbar