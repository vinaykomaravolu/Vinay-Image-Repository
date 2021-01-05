import React from 'react';
import Particles from 'react-particles-js';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: "-1",
    }
}));

export default function UploadImages(props) {
    const classes = useStyles();

    return (
        <Particles
        params={{
            "particles": {
                "number": {
                    "value": 60
                },
                "size": {
                    "value": 3
                },"move": {
                    "random": true,
                    "speed": 1,
                    "out_mode": "out"
                }
            },
        }}
            className={classes.root} />
    );
}
