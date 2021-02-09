import { CreateMessageInput, CreateProfileInput, Stage } from '../../API';
import Message from '../../components/Chat/Message/Message';
import * as actions from './MessageActions';

type MessageReducer = {
    stage: Stage,
    subjectID: string,
    interlocutor: CreateProfileInput,
    dialogue: CreateMessageInput[],
}

const initialState: MessageReducer = {
    dialogue: [],
    stage: Stage.UNASSIGNED,
    subjectID: 'unassigned',
    interlocutor: { email: "unassigned", name: "unassigned" }
};

export const EmployeeReducer = (state = initialState, action: ActionTypes): MessageReducer => {
    switch (action.type) {
        case 'SEND_MESSAGE':
            return {
                ...state,
                dialogue: [...state.dialogue, action.payload]
            }
        case 'SEND_MESSAGE_SUCCESS':
            state.dialogue.pop();
            return {
                ...state,
                dialogue: [...state.dialogue, action.payload]
            }
        case 'GET_RECENT_MESSAGE':
            if (action.payload.senderID === state.interlocutor.id)
                return {
                    ...state,
                    dialogue: [...state.dialogue, action.payload]
                }; else
                return { ...state }
        case 'GET_UPDATED_MESSAGE':
            if (action.payload.senderID === state.interlocutor.id) {
                const index = state.dialogue.findIndex((message) => (message.id === action.payload.id));
                const newDialogue = [...state.dialogue]
                newDialogue[index] = action.payload;
                return {
                    ...state,
                    dialogue: newDialogue
                }
            } else
            return { ...state }

        case 'OPEN_DIALOGUE':
            return {
                ...state,
                stage: action.payload.stage,
                subjectID: action.payload.subjectID,
                interlocutor: action.payload.interlocutor
            }
        case 'OPEN_DIALOGUE_SUCCESS':
            return {
                ...state,
                dialogue: action.payload
            }
        case 'SEND_MESSAGE_FAILURE':
        case 'UPDATE_MESSAGE_SUCCESS':
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