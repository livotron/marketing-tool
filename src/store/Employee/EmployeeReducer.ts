import { CreateEmployeeInput } from '../../API';
import * as actions from './EmployeeActions';

const initialState: CreateEmployeeInput = {
        businessID: "",
        roleTags: {
           sales: false,
           marketing: false,
           logistics: false,
           accounting: false,
           production: false,
           qualityControl: false 
        },
        phoneNumber: "",
        countryCode: {
            code: "",
            label: "",
            phone: ""
        }
};

export const EmployeeReducer = (state = initialState, action: ActionTypes): CreateEmployeeInput => {
    switch (action.type) {
        case 'SET_EMPLOYEE_DATA':
            return {
                ...state, ...action.payload
            }
        case 'SET_ROLE_TAGS':
            return {
                ...state,
                roleTags: action.payload
            };
        default:
            return {
                ...state,
            };
    }
};
type InferValueTypes<T> = T extends { [key: string]: infer U }
    ? U
    : never

export type ActionTypes = ReturnType<InferValueTypes<typeof actions>>;

export default EmployeeReducer;