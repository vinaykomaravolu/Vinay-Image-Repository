import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ErrorIcon from '@material-ui/icons/Error';
import GroupIcon from '@material-ui/icons/Group';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import {
    Switch,
    useHistory,
} from "react-router-dom";
import PrivateRoute from '../components/PrivateRoute'
import YourImages from './YourImages';
import PublicImages from './PublicImages';
import Background from '../components/Background'

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        width: '100%',/* Magic here */
        justifyContent: 'center',
        alignItems: 'center',
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        alignItems: 'center',
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },
    drawerOpen: {
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: theme.spacing(7) + 1,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(7) + 1,
        },
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
}));

export default function Navbar() {
    const classes = useStyles();
    const history = useHistory();
    const [open, setOpen] = React.useState(false);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    function logout() {
        fetch('/api/logout', {
            method: "POST",
            headers: new Headers({
                "content-type": "application/json"
            })
        }).then(response => {
            if (response.status === 400) {
                alert("Could not log out");
            } else if (response.status === 200) {
                response.json().then(data => {
                    history.push("/signin")
                });
            }
        }).catch((error) => {
            console.log(error)
        });
    }

    return (
        <div className={classes.root}>
            <Background/>
            <CssBaseline />
            <Drawer
                variant="permanent"
                className={clsx(classes.drawer, {
                    [classes.drawerOpen]: open,
                    [classes.drawerClose]: !open,
                })}
                classes={{
                    paper: clsx({
                        [classes.drawerOpen]: open,
                        [classes.drawerClose]: !open,
                    }),
                }}
            >
                <div className={classes.toolbar}>
                    <List>
                        <ListItem>
                            {open ?
                                <IconButton
                                    onClick={handleDrawerClose}
                                    className={clsx(classes.menuButton)}
                                    edge="start"
                                >
                                    <ChevronLeftIcon />
                                </IconButton>
                                :
                                <IconButton
                                    color="inherit"
                                    aria-label="open drawer"
                                    onClick={handleDrawerOpen}
                                    edge="start"
                                    className={clsx(classes.menuButton, {
                                        [classes.hide]: open,
                                    })}
                                >
                                    <MenuIcon />
                                </IconButton>
                            }
                        </ListItem>
                    </List>
                </div>
                <Divider />
                <List>
                    <ListItem button onClick={() => {history.push("/app/yourimages")}} >
                        <ListItemIcon><ErrorIcon></ErrorIcon></ListItemIcon>
                        <ListItemText primary="Your Images" />
                    </ListItem>
                    <ListItem button onClick={() => {history.push("/app/publicimages")}}>
                        <ListItemIcon><GroupIcon></GroupIcon></ListItemIcon>
                        <ListItemText primary="Public Images" />
                    </ListItem>
                    <Divider />
                    <ListItem button onClick={logout}>
                        <ListItemIcon><ExitToAppIcon></ExitToAppIcon></ListItemIcon>
                        <ListItemText primary="Sign out" />
                    </ListItem>
                </List>
            </Drawer>
            <main
                className={clsx(classes.content, {
                    [classes.contentShift]: open,
                })}
            >
                <div className={classes.drawerHeader} />
                <Switch >
                    <PrivateRoute exact={true} path="/app/yourimages" component={YourImages} />
                    <PrivateRoute exact={true} path="/app/publicimages" component={PublicImages} />
                </Switch>
            </main>
        </div>
    );
}
