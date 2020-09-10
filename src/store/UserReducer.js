import * as actionType from './action'

const initslaseState = {
    user: null,
    error: '',
}
const rootReducer = (state = initslaseState, action) => {
    switch (action.type) {
        case actionType.selectUser:
            return {
                ...state,
                user: action.value
            }
        case actionType.logout:
            return {
                ...state,
                user: action.value
            }
        case actionType.error:
            return {
                ...state,
                error: action.value
            }
        case actionType.status:
            return {
                ...state.user,
                Status: action.value
            }
        default: return state
    }
}
export default rootReducer;