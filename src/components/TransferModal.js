import React, {useRef,useState,useEffect} from 'react';
//import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import tether from '../tether.png'

const TransferModal = (props) => {

    const toInput = useRef(null)
    const amountInput = useRef(null)
    const transferButton = useRef(null)

    const [loading,setLoading] = useState(false)

    useEffect(() => {
        setFormStatus()
    });

    const setFormStatus = () => {
        let buttonState = loading === true
        //console.log(buttonState)
        if ( toInput.current ) { toInput.current.disabled = buttonState }
        if ( amountInput.current ) { amountInput.current.disabled = buttonState }
        if ( transferButton.current ) { transferButton.current.disabled = buttonState }
        if ( document.getElementsByClassName('modal').length > 0 ) {
            document.getElementsByClassName('modal')[0].getElementsByClassName('btn-close')[0].disabled = buttonState
        }
    }

    let tetherBalance = 0
    if ( window.myWeb3 ) {
        tetherBalance = parseFloat(window.myWeb3.utils.fromWei(props.tetherBalance,'Ether')).toFixed(2)
    }

    const sendUSDT = (to,amount) => {
        setLoading(true)
        console.log(props.account)
        amount = window.myWeb3.utils.toWei(amount,'Ether')
        props.tether.methods.transfer(to,amount).send({from: props.account}).on('transactionHash', (hash) => {
            setLoading(false)
        })
        //setTimeout(()=>{setLoading(false)},2000)
    }

    return (
        <Modal show={props.show} onHide={props.toggleTransferModal} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Transfer</Modal.Title>
            </Modal.Header>
            <Modal.Body>

                <form
                    onSubmit={(event) => {
                        event.preventDefault()
                        sendUSDT(toInput.current.value,amountInput.current.value)
                    }}
                    className='mb-3'>
                    <div style={{ borderSpacing: '0 1em' }} >
                        <span className='float-end' style={{ marginRight: '8px' }}>
                            Balance : {tetherBalance} USDT
                        </span>
                        <div className='input-group mb-2'>
                            <span className="input-group-text" id="addon-wrapping">To : </span>

                            <input
                                ref={toInput}
                                type='text'
                                pattern='0x[a-gA-G0-9]{40}'
                                onInput={() => {
                                    //amountInput.current.value = "123.2r".replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
                                    //console.log(amountInput.current.value)
                                    toInput.current.value = toInput.current.value.toString().replace(/[^a-gA-Gx0-9]/g, '').replace(/(x.*)x/g, '$1')
                                }}
                                className='form-control'
                                placeholder='0x0'
                                required />
                        </div>
                        <div className='input-group mb-2'>
                            <input
                                ref={amountInput}
                                type='text'
                                pattern='[0-9.]*'
                                onInput={() => {
                                    //amountInput.current.value = "123.2r".replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
                                    //console.log(amountInput.current.value)
                                    amountInput.current.value = amountInput.current.value.toString().replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
                                }}
                                className='form-control'
                                placeholder='0'
                                required />
                            <span className='input-group-text'>
                                <img alt='tether' src={tether} style={{ height: '32px' }} />
                                &nbsp;USDT
                            </span>
                            <button ref={transferButton} type='submit' className='btn btn-primary' >SEND</button>
                        </div>
                    </div>
                </form>

            </Modal.Body>

        </Modal>
    )
}

export default TransferModal;