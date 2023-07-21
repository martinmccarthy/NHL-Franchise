const AuthReducer = (state, action) => {
    switch(action.type) {
        case "LOGIN" || "UPDATE":
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