import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import IconButton from '@material-ui/core/IconButton';
import GridListTile from '@material-ui/core/GridListTile';
import GetAppIcon from '@material-ui/icons/GetApp';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { saveAs } from 'file-saver';

const useStyles = makeStyles((theme) => ({
    root: {
        margin: "12px",
        borderRadius: "10px",
    },
    input: {
        display: 'none',
    },
    icon: {
        color: 'rgba(255, 255, 255, 0.54)',
    },
    tile: {
        width: "275px",
        height: "275px",
        padding: "6px"
    },
    dialog: {
        width: "100%",
        height: "100%"
    },
    image: {
        width: "100%",
        height: "100%"
    },
    title: {
        backgroundColor: "#202020"
    }
}));

export default function ImageListing(props) {
    const classes = useStyles();
    const { iid, filename } = props;
    const [previewImage, setPreviewImage] = React.useState(null);
    const [shadow, setShadow] = React.useState(0);
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    React.useEffect(() => {
        if (iid) {
            fetch("/api/getImage/" + iid, {
                method: "GET",
            })
                .then(response => {
                    return response.blob();
                }).then(blob => {
                    setPreviewImage(URL.createObjectURL(blob));
                }).catch((error) => {
                    console.log(error);
                });
        }

    }, [iid])

    function handleDownloadImage() {
        fetch("/api/getImage/" + iid, {
            method: "GET",
        })
            .then(response => {
                return response.blob();
            }).then(blob => {
                saveAs(blob, filename);
            }).catch((error) => {
                console.log(error);
            });
    }

    return (
        <div>
            <Card onClick={handleClickOpen} style={shadow === 0 ? {} : { backgroundColor: "rgba(255, 255, 255, 0.2)" }} varient="elevation" onMouseOut={() => setShadow(0)} onMouseOver={() => setShadow(7)} elevation={shadow} className={classes.root}>
                <GridListTile className={classes.tile} key={previewImage}>
                    <img src={previewImage} alt={filename} />
                    <GridListTileBar
                        title={filename ? filename.split('.').slice(0, -1).join('.') : ""}
                        actionIcon={
                            <IconButton aria-label={`info about ${filename}`} className={classes.icon}>
                                <GetAppIcon onClick={() => handleDownloadImage()} />
                            </IconButton>
                        }
                    />
                </GridListTile>
            </Card>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth="md"
            >
                <DialogTitle className={classes.title} id="alert-dialog-title">{filename ? filename.split('.').slice(0, -1).join('.') : ""}</DialogTitle>
                <DialogContent>
                    <img className={classes.image} src={previewImage} alt={filename} />
                </DialogContent>
                <DialogActions>
                    <IconButton aria-label={`info about ${filename}`} className={classes.icon}>
                        <GetAppIcon onClick={() => handleDownloadImage()} />
                    </IconButton>
                    <Button onClick={handleClose}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>


    );
}
