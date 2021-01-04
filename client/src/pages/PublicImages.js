import React, { useEffect } from 'react';
import { Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from "@material-ui/core/InputAdornment";
import ImageListing from '../components/ImageListing';
import GridList from '@material-ui/core/GridList';



const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        overflow: 'hidden',
        justifyContent: "center",
        alignItems: "center"
    },
    gridList: {
        justifyContent: "center",
        width: "100%",
        height: "100%",
    },
    textfieldContainer: {
        margin: "17px",
        width: "30%",
    },
    textfield: {
        width: "100%",
        height: "100%"
    }
}));

export default function PublicImages() {
    const classes = useStyles();
    // eslint-disable-next-line
    const [searchTerm, setSearchTerm] = React.useState("");
    const [allImageList, setAllImageList] = React.useState([]);


    const handleSearchTermChange = (event) => {
        event.preventDefault();
        const searchRequest = '/api/getAllUserImageData' + (searchTerm ? "/" + searchTerm : "");
        updateAllUserImageList(searchRequest);

    }

    function updateAllUserImageList(request) {
        fetch(request, {
            method: 'GET',
            headers: new Headers({
                "content-type": "application/json",
            })
        })
            .then(response => response.json())
            .then(data => {
                setAllImageList(data);
            })
            .catch(err => {
                console.log(err)
            });
    }

    useEffect(() => {
        updateAllUserImageList("/api/getAllUserImageData");
    }, [])

    return (
        <div className={classes.root}>
            <Paper className={classes.textfieldContainer}>
                <form onSubmit={handleSearchTermChange}>
                    <TextField
                        className={classes.textfield}
                        name="searchBar"
                        variant="outlined"
                        label="Search Images"
                        size="medium"
                        autoFocus
                        onInput={(event) => setSearchTerm(event.target.value.trim())}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment>
                                    <IconButton type="Submit" disableFocusRipple={true} disableRipple={true}>
                                        <SearchIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </form>
            </Paper>

            <GridList cellHeight={180} className={classes.gridList}>
                {allImageList.map((imageData) => (
                    <ImageListing key={imageData.filename + imageData._id["$oid"]} iid={imageData._id["$oid"]} filename={imageData.filename} />
                ))}
            </GridList>
        </div>
    );
}
