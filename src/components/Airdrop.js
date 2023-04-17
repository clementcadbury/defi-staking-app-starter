import React, { Component } from 'react'

class Airdrop extends Component {
    // react code goes here

    constructor(props){
        super(props)
        this.state = {
            time: {},
            seconds: 20,
        }
        this.timer = 0
        this.startTimer = this.startTimer.bind(this)
        this.countDown = this.countDown.bind(this)
    }

    componentDidMount() {
        let timeLeftVar = this.secondsToTime(this.state.seconds)
        this.setState({time: timeLeftVar})

        //this.airdropReleaseToken()
    }

    countDown() {
        //count down
        let seconds = this.state.seconds - 1
        this.setState({
            time: this.secondsToTime(seconds),
            seconds: seconds
        })

        // stop at zero
        if ( seconds === 0 ) {
            clearInterval(this.timer)
            this.props.enableAirdropButton()
        }
    }

    startTimer() {
        if ( this.timer === 0 && this.state.seconds > 0) {
            //console.log('starting')
            this.timer = setInterval(this.countDown,1000)
        }
    }

    secondsToTime(secs) {
        let hours, minutes, seconds
        secs = parseInt(secs, 10);
        hours = Math.floor(secs / 3600);
        minutes = Math.floor(( secs - ( hours * 3600 ) ) / 60 )
        seconds = secs - ( hours * 3600 ) - ( minutes * 60 )

        

        //if (hours   < 10) {hours   = "0"+hours;}
        //if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}

        let obj = {
            h:hours,
            m:minutes,
            s:seconds
        }
        return obj

        /*return hours+':'+minutes+':'+seconds;*/
    }

    airdropReleaseToken() {
        let stakingBalance = window.web3.utils.fromWei(this.props.stakingBalance,'Ether')
        console.log(parseFloat(stakingBalance))
        if ( parseFloat(stakingBalance) >= 50 ) {
            this.startTimer()
        }
    }

    render() {
        return (
            <span>
                {this.state.time.m}:{this.state.time.s}
            </span>
        )
    }

}

export default Airdrop