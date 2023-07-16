import { useContext, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../db/firebase";
import { AuthContext } from "../../context/AuthContext";
import { collection, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import './Login.css'
import { queryPlayer } from "../util";

function Login() {
    const [errorMsg, setErrorMsg] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const {dispatch} = useContext(AuthContext);
    const navigate = useNavigate();

    /*  Login takes the event as param to prevent refresh, then
        sends info to firebase authentication for verification,
        as of right now it uses email to check, but we could
        use username to sign in as well if we added a simple DB query */
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
        .then(async (userCredential) => {
            const uid = userCredential.user.uid;

            let user = await getDoc(doc(collection(db, 'users'), uid));

            let payload = user.data();
            payload.id = uid;
            /*  To avoid continuously querying the DB for user players we 
                just query them all on login and store them into local storage.
                This can be a bit of a pain to manage because of the difference
                between storing in the DB and stroing locally, but maybe I can
                look into references with Firebase. */
            for(let i = 0; i < payload.team.roster.length; i++) {
                let id = payload.team.roster[i];
                payload.team.roster[i] = await queryPlayer(id);
                payload.team.roster[i].id = id;
            }
            dispatch({type: "LOGIN", payload:payload});
            navigate('/app');
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            /*  I should adjust this with better messages based on the code, but as
                of right now I'm focused on other things. */
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