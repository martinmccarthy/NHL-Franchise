import { useContext, useState } from "react";    
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../db/firebase";
import { useLocation } from "react-router-dom";
import { collection, doc, setDoc } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { queryPlayer } from "../util";

function CreateAccount() {
    const [errorMsg, setErrorMsg] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const playerTeam = location.state;
    const {dispatch} = useContext(AuthContext);

    console.log(playerTeam);

    async function doLogin(e) {
        e.preventDefault();
        if(email.length === 0) {
            setErrorMsg('Email is a required field.')
            return;
        }
        if(username.length < 5) {
            setErrorMsg('Username is a required field and must be at least 8 characters.')
            return;
        }
        if(password.length < 8) {
            setErrorMsg('Password is a required field and must be at least 8 characters.')
            return;
        }

        function returnRosterIds(roster) {
            var ids = [];
            for(let i = 0; i < roster.length; i++) {
                ids.push(roster[i].id);
            }
            return ids;
        }

        createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;

            playerTeam.roster = returnRosterIds(playerTeam.roster);

            const userData = {
                email: email,
                pucks: 500,
                team: playerTeam,
                username: username
            }

            const userCollection = collection(db, 'users');
            const userDocRef = doc(userCollection, user.uid);
            setDoc(userDocRef, userData).then(async (res) => {
                let payload = userData;
                payload.id = user.uid;
                let tempLineup = [];
                for(let i = 0; i < payload.team.roster.length; i++) {
                    let id = payload.team.roster[i];
                    payload.team.roster[i] = await queryPlayer(id);
                    payload.team.roster[i].id = id;
                    tempLineup.push(payload.team.roster[i]);
                }
                payload.team.lineup = tempLineup;
                dispatch({type: "LOGIN", payload: payload});
                navigate('/app');

            }).catch((err) => {
                console.error(err);
            })
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(error);
            setErrorMsg(errorCode + " " + errorMessage);
        })
    }
    
    return(
        <div className='container' id='main-login-container'>
        <form className='container' id='login-container'>
            <h1 className="login-text text-center98" id='login-title'>Don't lose your team! Create an account with us!</h1>
            <label className="form-label form-text login-text">Email</label>
            <input required type="email" className="form-control formGroupExampleInput" placeholder="Email@example.com" onChange={event => setEmail(event.target.value)}/>
            <label className="form-label form-text login-text">Username</label>
            <input required type="input" className="form-control formGroupExampleInput" placeholder="Username" onChange={event => setUsername(event.target.value)}/>
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
            <span>Already have an account?<a id='sign-up-link' href='/login'>Login</a></span>
        </div>
        </div>
    )
}

export default CreateAccount;