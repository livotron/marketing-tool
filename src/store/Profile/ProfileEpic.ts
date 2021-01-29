
import { ActionsObservable, Epic, ofType, StateObservable } from 'redux-observable';
import { catchError, filter, map, mergeMap } from 'rxjs/operators';
import { fetchProfileByIdSuccess, saveProfileToDBFailed, saveProfileToDBSucces, updateProfileSuccess } from './ProfileActions';
import { ActionTypes } from './ProfileReducer';
import { Business, Profile } from '../../models';
import { AppStateType } from '../store';
import { ActionTypes as BusinessActionTypes } from '../Business/BusinessReducer';
import { createBusiness, createProfile, updateProfile } from '../../graphql/mutations';
import { API, graphqlOperation, Storage } from 'aws-amplify';
import { from, Observable } from 'rxjs';
import { getProfile } from '../../graphql/queries';
import { setBusiness } from '../Business/BusinessActions';

export default <Epic<ActionTypes, ActionTypes, AppStateType>[]> [
    (action$, state$) => action$.pipe(
        ofType('INITIATE_NEW_PROFILE'),
        mergeMap(() => {
            const businessData = state$.value.BusinessReducer;
            return from(API.graphql(graphqlOperation(createBusiness, { input: businessData })) as unknown as Promise<any>).pipe(
                mergeMap(res => {
                    const profile = state$.value.ProfileReducer;
                    //     ...state$.value.ProfileReducer,
                    //     businessID: res.data.createBusiness.id
                    // });
                    profile.businessID = res.data.createBusiness.id;
                    console.log("before setting profile ")
                    // profile.id = state$
                    return from(API.graphql(graphqlOperation(createProfile, { input: profile })) as unknown as Promise<any>);
                }),
                mergeMap(res => {
                    return [saveProfileToDBSucces(res.data.createProfile), setBusiness(res.data.createProfile.business)]
                }),
                catchError(err => { console.log(err); return [saveProfileToDBFailed()] })
            )
        }),
    ),

    (action$, state$) => action$.pipe(
        ofType('FETCH_PROFILE_BY_ID'),
        mergeMap((action: any) => {
            return from(API.graphql(graphqlOperation(getProfile, { id: action.payload })) as unknown as Promise<any>)
                .pipe(
                    mergeMap(res => {
                        console.log(res)
                        return [fetchProfileByIdSuccess(res.data.getProfile),setBusiness(res.data.getProfile.business)]
                    }),
                    catchError(err => { console.log(err); return [saveProfileToDBFailed()] })
                )
        })
    ),

    (action$, state$) => action$.pipe(
        ofType('SET_PROFILE_IMAGE'),
        mergeMap((action: any) => {
            action.payload.bufferImg
            if (state$.value.ProfileReducer.avatar) {
                Storage.remove(state$.value.ProfileReducer.avatar.key)
            }
            return from(Storage.put(action.payload.s3.key, action.payload.bufferImg, {
                contentType: 'image/png',
                contentEncoding: 'base64'
            })).pipe(
                mergeMap(res => {
                    const profileAvatar = {
                        id: state$.value.ProfileReducer.id,
                        avatar: action.payload.s3,
                    };
                    return from(API.graphql(graphqlOperation(updateProfile, { input: profileAvatar })) as unknown as Promise<any>);
                }),
                map(res => {
                    return updateProfileSuccess(res.data.updateProfile)
                }),
                catchError(err => { console.log(err); return [saveProfileToDBFailed()] })
            )
        })
    ),

    (action$, state$) => action$.pipe(
        ofType('UPDATE_PERSONAL_INFO'),
        mergeMap((action: any) => {
            const profile = {
                id: state$.value.ProfileReducer.id,
                name: action.payload.name,
                email: action.payload.email
            }

            return (from(API.graphql(graphqlOperation(updateProfile, { input: profile })) as unknown as Promise<any>).pipe(
                map(res => {
                    return updateProfileSuccess(res.data.updateProfile)
                }),
                catchError(err => { console.log(err); return [saveProfileToDBFailed()] })
            ))
        }),

    )
]