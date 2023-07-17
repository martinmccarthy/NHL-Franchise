const AuthReducer = (state, action) => {
    switch(action.type) {
        case "LOGIN" || "UPDATE":
            console.log('STATE: ', action.payload)
            return {
                currentUser: action.payload,
            };
        case "LOGOUT":
            return {
                currentUser: null
            };
        default:
            return state;
    }
}

export default AuthReducer;