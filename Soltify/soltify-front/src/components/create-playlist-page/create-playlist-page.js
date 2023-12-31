import React, { useState } from "react";
import './create-playlist-page.css';

import { useNavigate } from "react-router-dom";

import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase";

import Input from "../utilities/input-item/input";

import playlistDefault from '../../assets/playlistdefault.jpg'


const CreatePlaylistPage = () => {
    const [playlistIMG, setPlaylistIMG] = useState("");
    const [playlistSource, setPlaylistSource] = useState("");
    const [playlistTitle, setPlaylistTitle] = useState("");

    const [playlistCreatingState, setPlaylistCreatingState] = useState(false);

    const navigate = useNavigate()
    const storage = getStorage()

    const selectIMG = (event)=> {
        setPlaylistSource(event.target.files[0]);

        const reader = new FileReader();
        reader.readAsDataURL(event.target.files[0]);

        reader.onload = (event) => {
          setPlaylistIMG(event.target.result);
        }
    }

    const uploadIMG = async() => {
        const storageRef = ref(storage, 'images/' + playlistSource.name);
        const uploadTask = uploadBytesResumable(storageRef, playlistSource);

        uploadTask.on('state_changed',
            (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            document.querySelector(".creating_progress_bar div").style.width = progress + "%";
        }, 
        (error) => {
            console.log(error);
        }, 
        async () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                console.log('File available at', downloadURL);
                uploadPlaylist(downloadURL);
            });
        });
    }

    const createPlaylist = async() => {
        if(playlistSource) {
            setPlaylistCreatingState(true)
            await uploadIMG();
            return;
        }
        setPlaylistCreatingState(true)
        await uploadPlaylist("");
    }

    const uploadPlaylist = async(imgURL) => {
        const userRef = doc(db, "users", (JSON).parse(localStorage.getItem('user')).uid);

        await updateDoc(userRef, {
            playlist: arrayUnion({
                "name": playlistTitle,
                "img": imgURL,
                "songs": []
            })
        }).then(() => {
            setPlaylistCreatingState(false);
            setPlaylistTitle("");
        }).finally(() => navigate("/home/playlists"))
    };

    return <div>
        {
            playlistCreatingState
            ?
                <div className={"creating_progress"}>
                    <div className={"progress_popup"}>
                        <span>Playlist is creating ...</span>
                        <div className={"creating_progress_bar"}>
                            <div></div>
                        </div>
                    </div>
                </div>
            :
                ''
        }
        <span className={"acc_title"}>Create Playlist</span>
        <div className={"create_area"}>
            <div className={"playlist_ft_imf"}>
                <input type="file" id={"img_for_playlist"} onChange={selectIMG} />
                <img src={playlistIMG ? playlistIMG : playlistDefault} alt={playlistDefault} />
                <label htmlFor="img_for_playlist"></label>
            </div>
            <div className={"playlist_data"}>
                <div>Fill the fields</div>
                <Input props={{name: 'Playlist name'}} onChange={(e) => {setPlaylistTitle(e.target.value)}}/>
                <button onClick={createPlaylist}>Create</button>
            </div>
        </div>
    </div>
}

export default CreatePlaylistPage;