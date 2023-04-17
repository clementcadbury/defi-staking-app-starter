import React, {Component} from 'react'

class Reward extends Component {
    // react code goes here

    componentDidMount() {
        
    }

    constructor(props){
        super(props)
        this.state={
            reward: '0'
        }
    }

    render() {
        return (
            <span>
                {this.state.reward}
            </span>
        )
    }
}

export default Reward