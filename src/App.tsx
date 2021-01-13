import React, {ReactElement, useEffect} from 'react';
import './App.css';
import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';
import store, {AppStateType} from "./store/store";
import {connect, Provider} from "react-redux";
import {BrowserRouter} from "react-router-dom";
import {Route, Switch} from "react-router";
import RegistrationPage from './pages/RegistrationPage/RegistrationPage';
import LoginPage from "./pages/LoginPage/LoginPage";
import OverridesCss from './material/themeProvider';
import LoginFormContainer from "./components/LoginForm/LoginFormContainer";
import { Dispatch } from 'redux';
import { getAuthData } from './store/Auth/AuthActions';
import Dashboard from './components/DashBoard/Dashboard';
import TempDashboard from "./pages/TempDashbord/TempDashboard";

Amplify.configure(awsconfig);

function App(props: any): ReactElement {

    useEffect(() => { // Start initialization
        props.getAuthData();
    }, []);

    if (!props.initialized) { //Show empty page while initialization isn't completed
        return (
            <div/>
        )
    }

    return (
        <Switch>
            <Route path='/' exact component={TempDashboard}/>
            <Route path='/login' component={LoginPage}/>
            <Route path='/register' component={RegistrationPage}/>
            <Route path='/dashboard' component={Dashboard} />
        </Switch>
    );
}

type MapDispatchType = {
    getAuthData: () => void
}

const mapStateToProps = (state: AppStateType) => {
    return {
        initialized: state.AuthReducer.initialized
    }
};

const mapDispatchToProps = (dispatch: Dispatch): MapDispatchType => {
    return {
        getAuthData: () => dispatch(getAuthData())
    }
};

const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);

const AppWithRouter = () => { // Store render before App initialization
    return (
        <OverridesCss>
            <BrowserRouter>
                <Provider store={store}>
                    <AppContainer/>
                </Provider>
            </BrowserRouter>
        </OverridesCss>
    )
}

export default AppWithRouter;