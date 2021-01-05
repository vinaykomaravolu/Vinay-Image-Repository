import React, { useEffect } from 'react';
import { Container, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from "@material-ui/core/InputAdornment";
import ImageListing from '../components/ImageListing';
import GridList from '@material-ui/core/GridList';
import InfiniteScroll from "react-infinite-scroll-component";

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: "center",
        alignItems: "center",
    },
    gridList: {
        justifyContent: "center",
        maxWidth: "100%",
        maxHeight: "100%",
        margin: "10px"
    },
    imageContainer: {
        maxWidth: "100vw",
        maxHeight: "79vh",
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
    const [numImages, setNumImages] = React.useState(20);
    const [hasMore, setHasMore] = React.useState(true);



    const handleSearchTermChange = (event) => {
        event.preventDefault();
        setNumImages(20);
        setHasMore(20);
        const searchRequest = '/api/getAllUserImageData' + (searchTerm ? "/" + searchTerm : "");
        updateAllUserImageList(searchRequest);

    }

    function updateAllUserImageList(request) {
        fetch(request + "/" + numImages, {
            method: 'GET',
            headers: new Headers({
                "content-type": "application/json",
            })
        })
            .then(response => response.json())
            .then(data => {
                setAllImageList(data);
                if(data.length < numImages){
                    setHasMore(false);
                }
            })
            .catch(err => {
                console.log(err)
            });
    }

    useEffect(() => {
        const request = `/api/getAllUserImageData/${numImages}`
        fetch(request, {
            method: 'GET',
            headers: new Headers({
                "content-type": "application/json",
            })
            })
            .then(response => response.json())
            .then(data => {
                setAllImageList(data);
                if(data.length < numImages){
                    setHasMore(false);
                }
            })
            .catch(err => {
                console.log(err)
            });
    }, [numImages])

    const fetchMoreData = () => {
        if (numImages >= 500) {
          setHasMore(false);
          return;
        }
        setNumImages(numImages + 20);
        const searchRequest = '/api/getAllUserImageData' + (searchTerm ? "/" + searchTerm : "");
        updateAllUserImageList(searchRequest);

      };
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
            <Container className={classes.imageContainer}>
                <InfiniteScroll
                    dataLength={numImages}
                    next={fetchMoreData}
                    hasMore={hasMore}
                    loader={<h4>Loading...</h4>}
                    className={classes.gridList}
                    endMessage={
                        <p style={{ textAlign: "center" }}>
                            <b>No More</b>
                        </p>
                    }
                >
                <GridList cellHeight={180} className={classes.gridList}>
                    {allImageList.map((imageData) => (
                        <ImageListing key={imageData.filename + imageData._id["$oid"]} iid={imageData._id["$oid"]} filename={imageData.filename} />
                    ))}
                
                </GridList>
            </InfiniteScroll>
            </Container>
            
        </div>
    );
}
