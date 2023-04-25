import React, { PureComponent } from 'react'

class OwnerCard extends PureComponent {

    constructor(props) {
        super(props)
        this.state = {
            fakeTetherBalance: '0',
            rwdBalance: '0',
        }
        this.timer = null
    }

    componentDidMount() {
        this.updateValues()
        this.timer = setInterval(this.updateValues,5000)
    }

    componentDidUpdate() {
        //this.updateValues()
    }

    componentWillUnmount() {
        clearInterval(this.timer)
        this.timer = null
    }

    updateValues = async () => {
        //console.log(this)
        if ( this.props.fakeTether.methods && this.props.rwd.methods && this.props.decentralBank.methods ) {
            const fakeTetherBalance = await this.props.fakeTether.methods.balanceOf(this.props.decentralBank._address).call()
            const rwdBalance = await this.props.rwd.methods.balanceOf(this.props.decentralBank._address).call()

            this.setState({
                fakeTetherBalance: fakeTetherBalance.toString(),
                rwdBalance: rwdBalance.toString(),
            })
            //console.log('Balances reloaded in App')
        }
    }

    render() {
        let rwdBalance = '0', fakeTetherBalance = '0'
        if (window.myWeb3) {
            rwdBalance = window.myWeb3.utils.fromWei(this.state.rwdBalance, 'Ether')
            fakeTetherBalance = window.myWeb3.utils.fromWei(this.state.fakeTetherBalance, 'Ether')
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
                        <b>contract FakeTether balance :</b><br />
                        {fakeTetherBalance}
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

