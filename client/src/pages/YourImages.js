import * as React from 'react';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import DeleteIcon from '@material-ui/icons/Delete';
import ImageIcon from '@material-ui/icons/Image';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import Collapse from '@material-ui/core/Collapse';
import Box from '@material-ui/core/Box';
import Cookies from 'js-cookie';
import FormGroup from '@material-ui/core/FormGroup';
import UploadImages from '../components/UploadImages';
import GetAppIcon from '@material-ui/icons/GetApp';
import TextField from '@material-ui/core/TextField';
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from '@material-ui/icons/Search';
import Button from '@material-ui/core/Button';
import { saveAs } from 'file-saver';

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

const headCells = [
    {
        id: 'filename',
        numeric: false,
        disablePadding: true,
        label: "Images",
    },
    {
        id: 'contentType',
        numeric: true,
        disablePadding: false,
        label: 'Type',
    },
    {
        id: 'uploadDate',
        numeric: true,
        disablePadding: false,
        label: 'Upload Date',
    },
    {
        id: 'privacy',
        numeric: true,
        disablePadding: false,
        label: 'Privacy',
    },
    {
        id: 'Delete',
        numeric: true,
        disablePadding: false,
    },
    {
        id: 'Download',
        numeric: true,
        disablePadding: false,
    },
    {
        id: 'Dropdown',
        numeric: true,
        disablePadding: false,
    }
];

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100%',
    },
    paper: {
        width: '100%',
        marginBottom: theme.spacing(2),
    },
    table: {
        minWidth: 750,
    },
    box: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    upload: {
        display: "flex",
        justifyContent: "flex-end"
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

function EnhancedTableHead(props) {
    const {
        onSelectAllClick,
        order,
        orderBy,
        numSelected,
        rowCount,
        onRequestSort,
    } = props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow style={{ "backgroundColor": "black" }}>
                <TableCell padding="checkbox">
                    <Checkbox
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={onSelectAllClick}
                        inputProps={{
                            'aria-label': 'select all images',
                        }}
                    />
                </TableCell>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        padding={headCell.disablePadding ? 'none' : 'default'}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                        >
                            <Typography style={{ "textAlign": 'center', "fontWeight": 600, "fontSize": 15 }}>{headCell.label}</Typography>
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

const useToolbarStyles = makeStyles((theme) => ({
    root: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(1),
    },
    highlight:
        theme.palette.mode === 'light'
            ? {
                color: theme.palette.secondary.main,
                backgroundColor: lighten(theme.palette.secondary.light, 0.85),
            }
            : {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.secondary.dark,
            },
    title: {
        flex: '1 1 100%',
    },
    button: {
        borderRadius: "30px",
        width: "10%",
        margin: "5px"
    }
}));

const EnhancedTableToolbar = (props) => {
    const classes = useToolbarStyles();
    const { numSelected, selected, handlePrivacyChanges, handleDownloadImages, handleDeleteImages } = props;

    return (
        <Toolbar
            className={clsx(classes.root, {
                [classes.highlight]: numSelected > 0,
            })}
        >
            {numSelected > 0 ? (
                <Typography
                    className={classes.title}
                    color="inherit"
                    variant="subtitle1"
                    component="div"
                >
                    {numSelected} selected
                </Typography>
            ) : (
                    <Typography
                        className={classes.title}
                        variant="h6"
                        id="tableTitle"
                        component="div"
                    >
                        Image Repository
                    </Typography>
                )}
            {numSelected > 0 ? (
                <Tooltip title="Delete">
                    <Button
                        variant="contained"
                        color="primary"
                        size="medium"
                        className={classes.button}
                        onClick={(event) => handlePrivacyChanges(event, selected, "public")}>
                        Make Public
                    </Button>
                </Tooltip>
            ) : null}
            {numSelected > 0 ? (
                <Tooltip title="Delete">
                    <Button
                        variant="contained"
                        color="primary"
                        size="medium"
                        className={classes.button}
                        onClick={(event) => handlePrivacyChanges(event, selected, "private")}>
                        Make Private
                    </Button>
                </Tooltip>
            ) : null}
            {numSelected > 0 ? (
                <Tooltip title="Delete">
                    <IconButton onClick={(event) => handleDeleteImages(event, selected)} >
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            ) : null}
            {numSelected > 0 ? (
                <Tooltip title="Download">
                    <IconButton onClick={(event) => handleDownloadImages(event, selected)}>
                        <GetAppIcon />
                    </IconButton>
                </Tooltip>
            ) : null}
        </Toolbar>
    );
};

function Row(props) {
    const {
        row,
        labelId,
        isItemSelected,
        handleClick,
        handleDownloadImage,
        handleDeleteImage
    } = props;
    const [previewImage, setPreviewImage] = React.useState(null);
    const [privacy, setPrivacy] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const classes = useStyles();

    React.useEffect(() => {
        setPrivacy(row.privacy === "private" ? true : false);
    }, [row])

    const handleOpen = (event) => {
        event.stopPropagation();
        if (!previewImage) {
            fetch("/api/getImage/" + row.id, {
                method: "GET",
            })
                .then(response => {
                    return response.blob();
                }).then(blob => {
                    setPreviewImage(URL.createObjectURL(blob));
                    setOpen(!open)
                }).catch((error) => {
                    console.log(error);
                });
        } else {
            setOpen(!open)
        }
    }

    const handleSwitchPrivacy = (event) => {
        event.stopPropagation();
        let privacyBool = event.target.checked;
        const imageIDs = [row.id];
        fetch("/api/changeImagePrivacy", {
            method: "PATCH",
            headers: new Headers({
                "X-CSRF-TOKEN": Cookies.get("csrf_access_token"),
                "content-type": "application/json"
            }),
            body: JSON.stringify({ "privacy": (privacyBool ? "private" : "public"), "imagesToChangePrivacy": imageIDs })
        })
            .then(response => {
                if (response.status === 200) {
                    setPrivacy(privacyBool);
                }
            }).catch((error) => {
                console.log(error);
            });
    }

    return (
        <React.Fragment>
            <TableRow
                hover
                onClick={(event) => handleClick(event, row)}
                role="checkbox"
                aria-checked={isItemSelected}
                tabIndex={-1}
                key={row.id}
                selected={isItemSelected}
            >
                <TableCell padding="checkbox">
                    <Checkbox
                        checked={isItemSelected}
                        inputProps={{
                            'aria-labelledby': labelId,
                        }}
                    />
                </TableCell>
                <TableCell id={labelId} component="th" scope="row">
                    {row.filename ? row.filename.split('.').slice(0, -1).join('.') : ""}
                </TableCell>
                <TableCell>
                    {row.filename ? row.filename.split('.').pop() : ""}
                </TableCell>
                <TableCell>{row.uploadDate ? (new Date(row.uploadDate)).toLocaleString() : ""}</TableCell>
                <TableCell padding="checkbox">
                    <FormGroup row>
                        <FormControlLabel
                            control={<Switch checked={privacy} onClick={(event) => {handleSwitchPrivacy(event)}} name="privacy" />}
                            label={privacy ? "Private" : "Public"}
                        />
                    </FormGroup>
                </TableCell>
                <TableCell padding="checkbox">
                    <IconButton onClick={(event) => handleDeleteImage(event, [row])} >
                        <DeleteIcon />
                    </IconButton>
                </TableCell>
                <TableCell padding="checkbox">
                    <IconButton onClick={(event) => handleDownloadImage(event, [row])} >
                        <GetAppIcon />
                    </IconButton>
                </TableCell>
                <TableCell padding="checkbox">
                    <IconButton aria-label="expand row" size="small" onClick={(event) => handleOpen(event)}>
                        {open ? <KeyboardArrowUpIcon /> : <ImageIcon />}
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box className={classes.box}>
                            {previewImage && <img style={{ maxWidth: "85%" }} alt="yourimages" src={previewImage}></img>}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    )
}

export default function YourImages() {
    const classes = useStyles();
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('calories');
    const [selected, setSelected] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [dense, setDense] = React.useState(false);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [rows, setRows] = React.useState([]);
    const [searchTerm, setSearchTerm] = React.useState("");

    React.useEffect(() => {
        updateUserImages('/api/getUserImageData');
    }, [])

    const handleSearchTermChange = (event) => {
        event.preventDefault();
        const searchRequest = '/api/getUserImageData' + (searchTerm ? "/" + searchTerm : "");
        updateUserImages(searchRequest);
    }

    function handleDeleteImages(event, images) {
        event.stopPropagation();
        const imageIDs = images.map((image) => {
            return image.id;
        });
        fetch("/api/deleteImages", {
            method: "PATCH",
            headers: new Headers({
                "X-CSRF-TOKEN": Cookies.get("csrf_access_token"),
                "content-type": "application/json",
            }),
            body: JSON.stringify({ "imagesToDelete": imageIDs })
        })
            .then(response => {
                if (response.status === 200) {
                    const difference = rows.filter(image => images.indexOf(image) === -1);
                    setRows(difference);
                    setSelected([]);
                } else {
                    console.log("Failed to delete image");
                }
            }).catch((error) => {
                console.log(error);
            });
    }

    function handleDownloadImages(event, images) {
        event.stopPropagation();
        images.forEach((image) => {
            fetch("/api/getImage/" + image.id, {
                method: "GET",
            })
                .then(response => {
                    return response.blob();
                }).then(blob => {
                    saveAs(blob, image.filename);
                }).catch((error) => {
                    console.log(error);
                });
        })
    }

    const handlePrivacyChanges = (event, images, privacy) => {
        event.stopPropagation();
        const imageIDs = images.map((image) => {
            return image.id;
        });
        fetch("/api/changeImagePrivacy", {
            method: "PATCH",
            headers: new Headers({
                "X-CSRF-TOKEN": Cookies.get("csrf_access_token"),
                "content-type": "application/json"
            }),
            body: JSON.stringify({ "privacy": privacy, "imagesToChangePrivacy": imageIDs })
        })
            .then(response => {
                if (response.status === 200) {
                    updateUserImages('/api/getUserImageData');
                }
            }).catch((error) => {
                console.log(error);
            });
    }

    function handleUpload(event) {
        event.preventDefault();
        const data = new FormData();
        for (const file of event.target.files) {
            data.append('files[]', file, file.name);
        }
        fetch('/api/uploadImages', {
            method: "POST",
            body: data,
            headers: new Headers({
                "X-CSRF-TOKEN": Cookies.get("csrf_access_token"),
            })
        })
            .then(response => response.json())
            .then(data => {
                data.forEach((imageData) => {
                    imageData.uploadDate = imageData.uploadDate["$date"];
                    imageData.id = imageData._id["$oid"];
                })
                const newUserImages = rows.concat(data).sort();
                setRows(newUserImages);
            }).catch((error) => {
                console.log(error)
            });
    }

    const updateUserImages = (request) => {
        fetch(request, {
            method: "GET",
            headers: {
                "content-type": "application/json",
            }
        })
            .then(response => {
                return response.json()
            }).then(data => {
                data.forEach((imageData) => {
                    imageData.uploadDate = imageData.uploadDate["$date"];
                    imageData.id = imageData._id["$oid"];
                })
                setSelected([]);
                setRows(data);
            }).catch((error) => {
                console.log(error);
            });
    }

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = rows;
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, image) => {
        const selectedIndex = selected.indexOf(image);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, image);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }

        setSelected(newSelected);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleChangeDense = (event) => {
        setDense(event.target.checked);
    };

    const isSelected = (id) => selected.indexOf(id) !== -1;

    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    return (
        <div className={classes.root}>
            <div style={{ width: '100%' }}>
                <Box display="flex" p={1}>
                    <Box p={1} width="100%">
                        <form onSubmit={handleSearchTermChange}>
                            <Paper className={classes.textfieldContainer}>
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
                            </Paper>
                        </form>
                    </Box>
                    <Box p={1} flexShrink={0}>
                        <UploadImages handleUpload={handleUpload} />
                    </Box>
                </Box>
                <FormControlLabel
                    control={<Switch checked={dense} onChange={handleChangeDense} />}
                    label="Shrink UI"
                />
            </div>
            <Paper className={classes.paper}>
                <EnhancedTableToolbar 
                    selected={selected} 
                    handlePrivacyChanges={handlePrivacyChanges} 
                    handleDownloadImages={handleDownloadImages} 
                    handleDeleteImages={handleDeleteImages} 
                    numSelected={selected.length} 
                />
                <TableContainer>
                    <Table
                        className={classes.table}
                        aria-labelledby="tableTitle"
                        size={dense ? 'small' : 'medium'}
                    >
                        <EnhancedTableHead
                            classes={classes}
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={handleSelectAllClick}
                            onRequestSort={handleRequestSort}
                            rowCount={rows.length}
                        />
                        <TableBody>
                            {stableSort(rows, getComparator(order, orderBy))
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row, index) => {
                                    const isItemSelected = isSelected(row);
                                    const labelId = `enhanced-table-checkbox-${index}`;

                                    return (
                                        <Row
                                            key={row.id + row.uploadDate}
                                            row={row}
                                            labelId={labelId}
                                            isItemSelected={isItemSelected}
                                            handleClick={handleClick}
                                            handleDeleteImage={handleDeleteImages}
                                            handleDownloadImage={handleDownloadImages}
                                        />
                                    );
                                })}
                            {emptyRows > 0 && (
                                <TableRow
                                    style={{
                                        height: (dense ? 33 : 53) * emptyRows,
                                    }}
                                >
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 100]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </Paper>
        </div>
    );
}
