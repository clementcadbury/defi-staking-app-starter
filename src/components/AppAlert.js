import React, { PureComponent } from 'react';
import Alert from 'react-bootstrap/Alert';


class AppAlert extends PureComponent {

    render() {
        return (
            <div className='fixed-top mx-auto' style={{ maxWidth: '600px', marginTop: '60px', opacity: '0.95' }}>
                <Alert variant="danger" onClose={() => {this.props.showAlertAction(false)}} show={this.props.showAlert} dismissible>
                    <Alert.Heading>{this.props.alertTitle}</Alert.Heading>
                    <p>
                        {this.props.alertText}
                    </p>
                </Alert>
            </div>
        )
    }
}

export default AppAlert