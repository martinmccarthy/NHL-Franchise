import { useContext, useState } from "react";
import './Login.css'

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../db/firebase";
import { AuthContext } from "../../context/AuthContext";

function Login() {
    const [errorMsg, setErrorMsg] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const {dispatch} = useContext(AuthContext);

    async function doLogin(e) {
        e.preventDefault();
        if(email.length === 0) {
            setErrorMsg('Email is a required field.')
            return;
        }
        if(password.length === 0) {
            setErrorMsg('Password is a required field.')
            return;
        }

        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            dispatch({type: "LOGIN", payload:user});
            console.log(user);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            setErrorMsg(errorCode + " " + errorMessage);
        })
    }

    return(
        <div className='container' id='main-login-container'>
        <form className='container' id='login-container'>
            <h1 className="login-text text-center fw-semibold" id='login-title'>Login</h1>
            <label className="form-label form-text login-text">Email</label>
            <input required type="email" className="form-control formGroupExampleInput" placeholder="Email@example.com" onChange={event => setEmail(event.target.value)}/>
            <label className="form-label form-text login-text">Password</label>
            <input required type="password" className="form-control formGroupExampleInput2" placeholder="Password" onChange={event => setPassword(event.target.value)}/>
            <a id='forgot-pass-link' href='/forgot'>Forgot Password?</a>
            <div className='container' id='login-btn-container'>
                <button type="submit" className="btn btn-primary" id='login-btn' onClick={doLogin}>Login</button>
            </div>
            <div id="error-msg-container">
                <span className="text-center error-msg">{errorMsg}</span>
            </div>
        </form>
        <div className='container' id='create-account-container'>
            <a>Don't have an account?</a><a id='sign-up-link' href='/'>Sign Up</a>
        </div>
        </div>
    )
}

export default Login;