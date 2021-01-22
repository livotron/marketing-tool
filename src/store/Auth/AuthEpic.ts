import { ActionsObservable, ofType } from 'redux-observable';
import { mergeMap, switchMap, catchError, map } from 'rxjs/operators';
import { Auth } from "aws-amplify";
import {
    getAuthDataFailed,
    getAuthDataSuccess,
    signInFailed,
    signInSuccess,
    signOutFailed,
    signOutSuccess,
    signUpFailed,
    ResetLinkSuccess,
    ResetLinkFailed,
    sendNewPasswordSuccess,
    sendNewPasswordFailed,
} from "./AuthActions";
import { ActionTypes } from "./AuthReducer";
import { from, of } from 'rxjs';
import { initiateNewProfile, setProfileID } from '../Profile/ProfileActions';

export const signInEpic = (action$: ActionsObservable<any>) => action$.pipe(
    ofType("SIGN-IN-REQUEST"),
    switchMap(async (action) => {
        return Auth.signIn({
            username: action.payload.username,
            password: action.payload.password,
        }).then((response) => {
            console.log("signied in");
            console.log(response)
            return signInSuccess({
                userID: response.attributes.sub,
                email: response.attributes.email,
                emailVerified: response.attributes.email_verified,
                userName: response.attributes.given_name,
            });
        }).catch(err => {
            console.log(err)
            return signInFailed(err)
        });
    })
);

export const signUpEpic = (action$: ActionsObservable<any>) => action$.pipe(
    ofType("SIGN-UP-REQUEST"),
    mergeMap(action => {
        console.log(action); return from(Auth.signUp({
            username: action.payload.email,
            password: action.payload.password,
            attributes: {
                email: action.payload.email,
                given_name: action.payload.username
            }
        })).pipe(
            mergeMap(res => {
                console.log(res);
                // signUpSuccess(res.userSub),
                return from(Auth.signIn({
                    username: action.payload.email,
                    password: action.payload.password
                })).pipe(
                    catchError(err => of(signInFailed(err))),
                    mergeMap((response) => {
                        console.log(response); return [
                            setProfileID(response.attributes.sub),
                            signInSuccess({
                                userID: response.attributes.sub,
                                email: response.attributes.email,
                                emailVerified: response.attributes.email_verified,
                                userName: response.attributes.given_name,
                            }),
                            initiateNewProfile(),
                        ]
                    })
                )
                // InitialSignIn(action.payload.email, action.payload.password),

            }),
            catchError(err => of(signUpFailed(err)))
        )
    }
    )
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
    mergeMap(() => {
        return from(Auth.currentUserInfo());
    }),
    map(res => {
        console.log(res)
        if (res) return getAuthDataSuccess({
            userID: res.username,
            email: res.attributes.email,
            emailVerified: res.attributes.email_verified,
            userName: res.attributes.given_name
        });
        else return getAuthDataFailed();
    })
);

export const sendResetLinkEpic = (action$: ActionsObservable<any>) => action$.pipe(
    ofType("SEND-RESET-LINK"),
    switchMap(async (action) => {
        console.log("kek");
        return Auth.forgotPassword(action.payload.email)
            .then(data => {
                console.log(data)
                return ResetLinkSuccess({ data })
            })
            .catch(err => {
                console.log(err);
                return ResetLinkFailed({ err })
            });
    })
);

export const sendNewPasswordEpic = (action$: ActionsObservable<any>) => action$.pipe(
    ofType("SEND-NEW-PASSWORD"),
    switchMap(async (action) => {
        return Auth.forgotPasswordSubmit(action.payload.email, action.payload.code, action.payload.newPassword)
            .then(data => {
                console.log(data)
                return sendNewPasswordSuccess()
            })
            .catch(err => {
                console.log(err);
                return sendNewPasswordFailed()
            });
    })
);
