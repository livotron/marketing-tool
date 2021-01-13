import { ActionsObservable, ofType } from 'redux-observable';
import { Action } from 'redux';
import Observable from "rxjs/Observable";
import { switchMap } from 'rxjs/operators';
import {Auth} from "aws-amplify";
import {
    getAuthDataFailed,
    getAuthDataSuccess,
    signInFailed,
    signInSuccess,
    signOutFailed,
    signOutSuccess,
    signUpSuccess,
    signUpFailed
} from "./AuthActions";
import {ActionTypes} from "./AuthReducer";

export const signInEpic = (action$: ActionsObservable<any>) => action$.pipe(
    ofType("SIGN-IN-REQUEST"),
    switchMap(async (action ) => {
       return Auth.signIn({
            username: action.payload.username,
            password: action.payload.password,
        }).then((response) => {
            return signInSuccess(response);
        }).catch(err => {
           alert("Failed to Sign in");
           console.log(err)
           return signInFailed(err)
        });
    })
);

export const signUpEpic = (action$: ActionsObservable<any>) => action$.pipe(
    ofType("SIGN-UP-REQUEST"),
    switchMap(async(action) => {
        console.log("start signing up", action)
       return Auth.signUp({
            username: action.payload.username,
            password: action.payload.password,
        }).then((response) => {
            console.log(response)
            return signUpSuccess(response);
        }).catch(err => {
           console.log(err)
           return signUpFailed(err)
        });
    })
);

export const signOutEpic = (action$: ActionsObservable<ActionTypes>) => action$.pipe(
    ofType("SIGN-OUT-REQUEST"),
    switchMap(async () => {
        return Auth.signOut().then(() => {
            return signOutSuccess();
        }).catch(() => {
            alert("Failed to Sign Out");
            return signOutFailed()
        });
    })
);

export const getAuthDataEpic = (action$: ActionsObservable<ActionTypes>) => action$.pipe(
    ofType("AUTH-DATA-REQUEST"),
    switchMap(async () => {
        return Auth.currentUserInfo().then((response) => {
            if(response) return getAuthDataSuccess(response);
            else return getAuthDataFailed();
        })
    })
);