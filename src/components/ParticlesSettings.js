import React, { Component } from 'react'
import Particles from 'react-tsparticles'
import { loadFull } from "tsparticles"

class ParticlesSettings extends Component {
    // react code goes here
    render() {

        const particlesInit = async (engine) => {
            await loadFull(engine);
        }
        
        return (
            <div>
                <Particles
                id='tsparticles'
                init={particlesInit}
                options={{
                    background: {
                        color: {
                            value: "#0d47a1",
                        },
                    },
                    fpsLimit: 60,
                    particles: {
                        color: {
                            value: "#ffffff",
                        },
                        links: {
                            color: "#ffffff",
                            distance: 100,
                            enable: true,
                            opacity: 0.5,
                            width: 1,
                        },
                        move: {
                            directions: "none",
                            enable: true,
                            outModes: {
                                default: "out",
                            },
                            random: false,
                            speed: 4,
                            straight: false,
                        },
                        number: {
                            density: {
                                enable: true,
                                area: 800,
                            },
                            value: 80,
                        },
                        opacity: {
                            value: 0.5,
                        },
                        shape: {
                            type: "circle",
                        },
                        size: {
                            value: { min: 1, max: 3 },
                        },
                    },
                    detectRetina: true,
                }}
                />
            </div>
        )
    }
}

export default ParticlesSettings