import React, {useEffect, useState} from "react";
import './add-to-playlist.css';

import {addUserExactPlaylist} from "../../services/playlist-service";

import {userUID} from "../../services/user-service";
import playlistDefault from "../../../assets/playlistdefault.jpg";


const AddToPlaylist = ({type, id, isSearch, user}) => {

    const [playlistAddState, setPlaylistAddState] = useState(false);

    useEffect(() => {
        document.addEventListener("click", e => {
            if(e.target.className === "list_to_add" || e.target.className === "list_to_add_ul") {
                setPlaylistAddState(true); return;
            }
            if(e.target.id !== "add_to_playlist_btn" && e.target.className !== "add_to_playlist_btn for_options") {
                setPlaylistAddState(false)
            }
        })
    }, []);

    if(type) {
        return <li className={"add_to_playlist_btn for_options"} onClick={() => setPlaylistAddState(playlistAddState => !playlistAddState)}>
            <ion-icon name="add-outline" id={"add_to_playlist_btn"}></ion-icon> Add to playlist
            {
                playlistAddState
                ?
                    <div className="list_to_add">
                        <span className={"back_to_options"} onClick={() => setPlaylistAddState(false)}><ion-icon name="arrow-back-outline"></ion-icon> Add to playlist: <ion-icon name="arrow-back-outline" style={{opacity: '0'}}></ion-icon></span>
                        <ul className={"list_to_add_ul"}>
                            {
                                user?.playlist?.map((pl, ind) => {
                                    if(ind > 0 && pl.songs.includes(id)) {
                                        return ind !== 0 ? <li onClick={() => addUserExactPlaylist(userUID, ind, id)}>
                                            <img src={!pl.img ? playlistDefault : pl.img} alt={pl.img} />
                                            <span>{pl.name} <ion-icon name="add-outline"></ion-icon></span>
                                            <ion-icon name="checkmark-outline" id={window.innerWidth > 451 ? "in_playlist_big" :"in_playlist"}></ion-icon>
                                        </li> : ''
                                    } else {
                                        return ind !== 0 ? <li onClick={() => addUserExactPlaylist(userUID, ind, id)}>
                                            <img src={!pl.img ? playlistDefault : pl.img} alt={pl.img} />
                                            <span>{pl.name} <ion-icon name="add-outline"></ion-icon></span>
                                        </li> : ''
                                    }
                                })
                            }
                        </ul>
                    </div>
                :
                    ''
            }
        </li>
    }

    return <div className={"add_to_playlist_btn"}>
        <ion-icon name="add-outline" id={"add_to_playlist_btn"} onClick={() => setPlaylistAddState(playlistAddState => !playlistAddState)}></ion-icon>
        {
            playlistAddState
            ?
                <div className="list_to_add">
                    <div id={"close_add_to_playlist"}>
                        <ion-icon name="close-outline" onClick={() => setPlaylistAddState(false)}></ion-icon>
                    </div>
                    <span className={"list_to_add_title"}>Add to playlist:</span>
                    <ul className={"list_to_add_ul"}>
                        {
                            user?.playlist?.map((pl, ind) => {
                                if(ind > 0 && pl.songs.includes(id)) {
                                    return ind !== 0 ? <li onClick={() => addUserExactPlaylist(userUID, ind, id)}>
                                        <img src={!pl.img ? playlistDefault : pl.img} alt={pl.img} />
                                        <span>{pl.name} <ion-icon name="add-outline"></ion-icon></span>
                                        <ion-icon name="checkmark-outline" id={window.innerWidth > 451 ? "in_playlist_big" :"in_playlist"}></ion-icon>
                                    </li> : ''
                                } else {
                                    return ind !== 0 ? <li onClick={() => addUserExactPlaylist(userUID, ind, id)}>
                                        <img src={!pl.img ? playlistDefault : pl.img} alt={pl.img} />
                                        <span>{pl.name} <ion-icon name="add-outline"></ion-icon></span>
                                    </li> : ''
                                }
                            })
                        }
                    </ul>
                </div>
            :
                    ''
        }
    </div>

}

export default AddToPlaylist;