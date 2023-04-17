import React, { Component } from 'react'

class OwnerCard extends Component {

    constructor(props) {
        super(props)
        this.state = {
            tetherBalance: '0',
            rwdBalance: '0',
        }
    }

    componentDidMount() {
        this.updateValues()
        setInterval(this.updateValues,5000)
    }

    componentDidUpdate() {
        //this.updateValues()
    }

    updateValues = async () => {
        if (this.props.tether.methods && this.props.rwd.methods && this.props.decentralBank.methods) {
            const tetherBalance = await this.props.tether.methods.balanceOf(this.props.decentralBank._address).call()
            const rwdBalance = await this.props.rwd.methods.balanceOf(this.props.decentralBank._address).call()

            this.setState({
                tetherBalance: tetherBalance.toString(),
                rwdBalance: rwdBalance.toString(),
            })
            //console.log('Balances reloaded in App')
        }
    }

    render() {
        let rwdBalance = '0', tetherBalance = '0'
        if (window.myWeb3) {
            rwdBalance = window.myWeb3.utils.fromWei(this.state.rwdBalance, 'Ether')
            tetherBalance = window.myWeb3.utils.fromWei(this.state.tetherBalance, 'Ether')
        }
        return (
            <div className="card rounded-0" style={{
                position: 'fixed',
                width: '400px',
                height: '100%',
                right: '0px',
                backgroundColor: '#ecf7e8',
            }}>
                <div className="card-header">
                    DecentralBank Contract
                </div>
                <div className="card-body">
                    <p className="card-text">
                        <b>contract address :</b><br />
                        {this.props.decentralBank._address}
                    </p>
                    <p className="card-text">
                        <b>contract tether balance :</b><br />
                        {tetherBalance}
                    </p>
                    <p className="card-text">
                        <b>contract rwd balance :</b><br />
                        {rwdBalance}
                    </p>
                </div>
            </div>

        )
    }
}

export default OwnerCard

