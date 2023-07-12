import { useState } from "react";    
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../db/firebase";
import { useLocation } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";

function CreateAccount() {
    const [errorMsg, setErrorMsg] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const location = useLocation();
    const playerTeam = location.state;
    console.log(playerTeam);

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

        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            let payload = {
                email: user.email,
                team: playerTeam
            }
            addDoc(collection(db, "users", user.uid), payload);
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
            <h1 className="login-text text-center98" id='login-title'>Don't lose your team! Create an account with us!</h1>
            <label className="form-label form-text login-text">Email</label>
            <input required type="email" className="form-control formGroupExampleInput" placeholder="Email@example.com" onChange={event => setEmail(event.target.value)}/>
            <label className="form-label form-text login-text">Password</label>
            <input required type="password" className="form-control formGroupExampleInput2" placeholder="Password" onChange={event => setPassword(event.target.value)}/>
            <div className='container' id='login-btn-container'>
                <button type="submit" className="btn btn-primary" id='login-btn' onClick={doLogin}>Create Account</button>
            </div>
            <div id="error-msg-container">
                <span className="text-center error-msg">{errorMsg}</span>
            </div>
        </form>
        <div className='container' id='create-account-container'>
            <a>Already have an account??</a><a id='sign-up-link' href='/login'>Login</a>
        </div>
        </div>
    )
}

export default CreateAccount;