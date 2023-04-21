import React, { PureComponent } from 'react';
import Modal from 'react-bootstrap/Modal';

import tether from '../tether.png'

class TransferModal extends PureComponent {

    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            setLoading: false,
        }
        this.toInput = React.createRef()
        this.amountInput = React.createRef()
        this.transferButton = React.createRef()
    }

    componentDidMount() {
        this.setFormStatus()
    }

    componentDidUpdate() {
        this.setFormStatus()
    }

    setFormStatus = () => {
        let buttonState = this.state.loading === true
        //console.log(buttonState)
        if (this.toInput.current) { this.toInput.current.disabled = buttonState }
        if (this.amountInput.current) { this.amountInput.current.disabled = buttonState }
        if (this.transferButton.current) { this.transferButton.current.disabled = buttonState }
        if (document.getElementsByClassName('modal').length > 0) {
            document.getElementsByClassName('modal')[0].getElementsByClassName('btn-close')[0].disabled = buttonState
        }
    }



    sendUSDT = (to, amount) => {
        this.setState({loading: true})
        console.log(this.props.account)
        amount = window.myWeb3.utils.toWei(amount, 'Ether')
        this.props.tether.methods.transfer(to, amount).send({ from: this.props.account }).on('transactionHash', (hash) => {
            this.setState({loading: false})
        })
        //setTimeout(()=>{setLoading(false)},2000)
    }

    render() {

        let tetherBalance = 0
        if (window.myWeb3) {
            tetherBalance = parseFloat(window.myWeb3.utils.fromWei(this.props.tetherBalance, 'Ether')).toFixed(2)
        }

        return (
            <Modal show={this.props.show} onHide={this.props.toggleTransferModal} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Transfer</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault()
                            this.sendUSDT(this.toInput.current.value, this.amountInput.current.value)
                        }}
                        className='mb-3'>
                        <div style={{ borderSpacing: '0 1em' }} >
                            <span className='float-end' style={{ marginRight: '8px' }}>
                                Balance : {tetherBalance} USDT
                            </span>
                            <div className='input-group mb-2'>
                                <span className="input-group-text" id="addon-wrapping">To : </span>

                                <input
                                    ref={this.toInput}
                                    type='text'
                                    pattern='0x[a-gA-G0-9]{40}'
                                    onInput={() => {
                                        //amountInput.current.value = "123.2r".replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
                                        //console.log(amountInput.current.value)
                                        this.toInput.current.value = this.toInput.current.value.toString().replace(/[^a-gA-Gx0-9]/g, '').replace(/(x.*)x/g, '$1')
                                    }}
                                    className='form-control'
                                    placeholder='0x0'
                                    required />
                            </div>
                            <div className='input-group mb-2'>
                                <input
                                    ref={this.amountInput}
                                    type='text'
                                    pattern='[0-9.]*'
                                    onInput={() => {
                                        //amountInput.current.value = "123.2r".replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
                                        //console.log(amountInput.current.value)
                                        this.amountInput.current.value = this.amountInput.current.value.toString().replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
                                    }}
                                    className='form-control'
                                    placeholder='0'
                                    required />
                                <span className='input-group-text'>
                                    <img alt='tether' src={tether} style={{ height: '32px' }} />
                                    &nbsp;USDT
                                </span>
                                <button ref={this.transferButton} type='submit' className='btn btn-primary' >SEND</button>
                            </div>
                        </div>
                    </form>

                </Modal.Body>

            </Modal>
        )
    }
}

export default TransferModal;