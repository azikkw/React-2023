import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

export function getUserPlaylist(userID, setUserPlaylist) {
    onSnapshot(doc(db, "users", userID), (doc) => {
        setUserPlaylist(doc.data()['playlist']);
    });
}

export async function getUserExactPlaylist(userID, index) {
    const docRef = doc(db, "users", userID);
    const docSnap = await getDoc(docRef);

    return docSnap.data()['playlist'][index];
}

export async function addUserExactPlaylist(userID, index, songID) {
    const docRef = doc(db, "users", userID);
    const docSnap = await getDoc(docRef);

    let songs = docSnap.data()['playlist'];
    songs[index]['songs'].push(songID);

    await updateDoc(docRef, {
        "playlist": songs
    });
}

export async function removeUserExactPlaylist(userID, index, songIndex) {
    const docRef = doc(db, "users", userID);
    const docSnap = await getDoc(docRef);

    let songs = docSnap.data()['playlist'];
    songs[index]['songs'].splice(songIndex, 1);

    await updateDoc(docRef, {
        "playlist": songs
    });
}


