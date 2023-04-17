import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const TransferModal = (props) => {

    return (
        <Modal show={props.show} onHide={props.toggleTransferModal}>
            <Modal.Header closeButton>
                <Modal.Title>Modal heading</Modal.Title>
            </Modal.Header>
            <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={props.toggleTransferModal}>
                    Close
                </Button>
                <Button variant="primary" onClick={props.toggleTransferModal}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default TransferModal;