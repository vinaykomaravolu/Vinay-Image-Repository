import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
        margin: "17px",
        height: "65%"
    },
    input: {
        display: 'none',
    },
    button: {
        width: "100%",
        height: "100%",
        borderRadius: "30px"
    }
}));

export default function UploadImages(props) {
    const classes = useStyles();
    const {handleUpload} = props;

    return (
        <div className={classes.root}>
            <input
                accept="image/*"
                className={classes.input}
                id="contained-button-file"
                multiple
                type="file"
                onChange={(event) => handleUpload(event)}
            />
            <label htmlFor="contained-button-file">
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    className={classes.button}
                    startIcon={<CloudUploadIcon />}
                    component="span"
                >
                    Upload
                </Button>
            </label>
        </div>
    );
}
