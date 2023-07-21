import {collection, addDoc} from 'firebase/firestore';
import { db } from '../db/firebase';


export async function signUp(user, team) {
    const userData = {
        email: user.email,
        pucks: 500,
        team: team,
        username: user.username
    }

    await addDoc(collection(db, 'users'), userData).then((res) => {
        console.log(res);
    }).catch((err) => {
        console.error(err);
    })
}