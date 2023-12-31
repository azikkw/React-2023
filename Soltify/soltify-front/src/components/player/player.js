import React, { useEffect, useRef, useState } from "react";
import './player.css';

import { Link, useNavigate } from "react-router-dom";
import { getMusic } from "../services/song-service";

import AddToPlaylist from "../utilities/add-to-playlist/add-to-playlist";
import {addUserExactPlaylist, removeUserExactPlaylist} from "../services/playlist-service";
import {userUID} from "../services/user-service";


const Player = ({props, user, setBegin, isPlaying, setIsPlaying, index, setIndex, playlist, setPlaylist}) => {
    const [prevPlaylist, setPrevPlaylist] = useState([]);

    const [mute, setMute] = useState(false);
    const [] = useState(false);
    const [playerActive, setPlayerActive] = useState(false);
    const [repeat, setRepeat] = useState(false);
    const [mixed, setMixed] = useState(false);


    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [volume, setVolume] = useState(50);

    const audioPlayer = useRef()
    const progressRef = useRef();

    const navigate = useNavigate();

    const getCurrentDuration = () => {
        const currentProgress = (audioPlayer.current?.currentTime / audioPlayer.current?.duration) * 100;
        setProgress(currentProgress);

        document.querySelector(".progress_bar").style.width = `${progress}%`;
    }

    function changeCurrent(e) {
        const progressWidth = progressRef.current.clientWidth;
        const clickedOffSetX = e.nativeEvent.offsetX;

        let isDragging = false;

        const handleMouseMove = (moveEvent) => {
            audioPlayer.current.muted = true;
            isDragging = true;

            const newPosition = (moveEvent.clientX - progressRef.current.getBoundingClientRect().left) / progressWidth * duration;

            const validNewPosition = Math.max(0, Math.min(newPosition, duration));

            audioPlayer.current.currentTime = validNewPosition;

            const currentProgress = (validNewPosition / duration) * 100;
            setProgress(currentProgress);

            document.querySelector(".progress_bar").style.width = `${currentProgress}%`;
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);

            if (!isPlaying && !isDragging) {
                audioPlayer.current.play();
                setIsPlaying(true);
            }

            audioPlayer.current.muted = false;
        };

        audioPlayer.current.muted = true;

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        if (!isDragging) {
            const newPosition = (clickedOffSetX / progressWidth) * duration;

            const validNewPosition = Math.max(0, Math.min(newPosition, duration));

            audioPlayer.current.currentTime = validNewPosition;

            const currentProgress = (validNewPosition / duration) * 100;
            setProgress(currentProgress);

            document.querySelector(".progress_bar").style.width = `${currentProgress}%`;

            if (!isPlaying) {
                audioPlayer.current.play();
                setIsPlaying(true);
            }

            audioPlayer.current.muted = false;
        }
    }


    function changeVolume(e) {
        let progressWidth = e.target.clientWidth;
        let clickedOffSetX = e.nativeEvent.offsetX;
        let volumeValue = Math.round((clickedOffSetX / progressWidth) * 100);

        document.querySelector(".volume_progress_bar").style.width = `${volumeValue}%`;
        setVolume(volumeValue);
    }


    function formatTime(time) {
        if(time && !isNaN(time)) {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60) < 10 ? `0${Math.floor(time % 60)}` : Math.floor(time % 60);

            return `${minutes}:${seconds}`;
        }
        return '0:00';
    }

    const setAudioMusic = async() => {
        await getMusic(playlist[index]?.musicID)
        .then((result) => {
            audioPlayer.current.src = result.url;
        });

        if(isPlaying) audioPlayer.current.play();
    }

    const togglePlay = () => {
        if(!audioPlayer.current.src) {
            setAudioMusic()
        }

        if(!isPlaying) audioPlayer.current.play()
        else audioPlayer.current.pause()

        setIsPlaying(prev => !prev)
    }

    const toggleSkip = (forward) => {
        if(forward) {
            if(index >= playlist.length - 1) setIndex(0);
            else setIndex(prev => prev + 1);
        } else {
            if(index > 0) setIndex(prev => prev - 1);
            else setIndex(prev => playlist.length - 1);
        }
    }

    const toggleReply = () => {
        if(!repeat) {
            setRepeat(true)
            document.querySelector(".repeat").classList.add("on");
        } else {
            setRepeat(false)
            document.querySelector(".repeat").classList.remove("on");
        }
    }

    const makeMix = () => {
        setPrevPlaylist([...playlist]);
        let shuffledArray = playlist.slice(index + 1);

        let shuffleArray =  async() => {
            let array = shuffledArray.slice();

            for(let i = array.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array
        }

        shuffleArray().then((res) => {
            setPlaylist([...playlist.slice(0, index + 1), ...res]);
        })
    }

    const toggleMix = () => {
        if(mixed === false) {
            setPrevPlaylist([...playlist]);
            let shuffledArray = playlist.slice(index + 1);

            let shuffleArray =  async() => {
                let array = shuffledArray.slice();

                for(let i = array.length - 1; i > 0; i--) {
                    let j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                return array
            }

            shuffleArray().then((res) => {
                setPlaylist([...playlist.slice(0, index + 1), ...res]);
            })
            setMixed(true);
        } else {
          setPlaylist([...playlist.slice(0, index + 1), ...prevPlaylist.slice(index + 1, prevPlaylist.length)]);
          setMixed(false);
        }
    }

    function changeImageCursor(event) {
        event.target.offsetWidth < 400 ? event.target.style.cursor = 'pointer' : event.target.style.cursor = 'default'
    }

    function playerActiveCondition(condition) {
        if(condition) {
            setPlayerActive(true)
            localStorage.setItem("playerCondition", "true")
        }
        else {
            setPlayerActive(false)
            localStorage.setItem("playerCondition", "false")
        }
    }

    const addOrRemove = () => {
        if(user.playlist[0].songs.includes(props.playlist[props.index].id)){
            removeUserExactPlaylist(userUID, 0, props.index);
        } else{
            addUserExactPlaylist(userUID, 0, props.playlist[props.index].id)
        }
    }

    useEffect(() => {
        setAudioMusic();
        if(mixed){
            makeMix();
        }
    }, [playlist[index]]);

    useEffect(() => {
        if(localStorage.getItem("playerCondition") === "true") {
            setPlayerActive(true)
        } else setPlayerActive(false)

        if(audioPlayer) audioPlayer.current.volume = volume / 100;

        setInterval(() => {
            const _duration = Math.floor(audioPlayer?.current?.duration);
            const _elapsed = Math.floor(audioPlayer?.current?.currentTime);

            setDuration(_duration);
            setElapsed(_elapsed);
        }, 10);


    }, [volume, isPlaying]);

    useEffect(() => {
        if(elapsed && elapsed === duration) {
            if(repeat) {
                setElapsed(0);
                audioPlayer.current.play();
            }
            else toggleSkip(true);
        }
    }, [elapsed]);

    useEffect(() => {
        setIsPlaying(!audioPlayer?.current?.paused);
    }, [audioPlayer?.current?.paused])

    return (
        <div className={!playerActive ? "player_background mini" : "player_background"} onClick={() => localStorage.getItem("user") == null ? navigate('/log-in') : ''}>
            <img src={playlist[index]?.img} alt={playlist[index]?.img} className={"player_background_animated_left"} />
            <img src={playlist[index]?.img} alt={playlist[index]?.img} className={"player_background_animated_right"} />
            <img src={playlist[index]?.img} alt={playlist[index]?.img} className={"player_background_img"} />
            <div className="player_background_layer">
                <audio ref={audioPlayer} muted={mute} onTimeUpdate={getCurrentDuration}/>
                <div className="close" onClick={() => playerActiveCondition(false)}>
                    <ion-icon name="close-outline"></ion-icon>
                </div>
                <div className="song_img">
                    <img src={playlist[index]?.img} alt={playlist[index]?.img} onClick={() => playerActiveCondition(true)} onMouseMove={(event) => changeImageCursor(event)} />
                    <div className="song_details for_mini_player">
                        <div className="name">{playlist[index]?.name}</div>
                        <Link to={`/home/artist/${playlist[index]?.artist.username}`} className="artist"> {playlist[index]?.artist.username}</Link>
                    </div>
                </div>
                <div className="player_controllers">
                    <div className="song_details">
                        <div className="name">{playlist[index]?.name}</div>
                        <div className="artist"> {playlist[index]?.artist.username}</div>
                    </div>
                    <div className="song_center">
                        <div className="song_progress" ref={progressRef} onMouseDown={(e) => changeCurrent(e)}>
                            <div className="progress_bar"></div>
                            <div className="timer">
                                <span className="current">{formatTime(elapsed)}</span>
                                <span className="duration">{formatTime(duration)}</span>
                            </div>
                        </div>
                        <div className="player_navigation">
                            <ion-icon name="shuffle-outline" class="random" onClick={toggleMix} style={mixed ? { color: "#25dc60" } : { color: "#efefef" }}></ion-icon>
                            <div className="center">
                                <ion-icon name="play-skip-back-outline" onClick={()=>toggleSkip(false)}></ion-icon>
                                <div className="play_pause" onClick={togglePlay}>
                                    { !isPlaying ? <ion-icon name="play" id="play"></ion-icon> : <ion-icon name="pause-outline" id="pause"></ion-icon> }
                                </div>
                                <ion-icon name="play-skip-forward-outline" onClick={()=>toggleSkip(true)}></ion-icon>
                            </div>
                            <ion-icon name="repeat-outline" class="repeat" onClick={toggleReply}></ion-icon>
                        </div>
                    </div>
                    <div className="player_options">
                        <ion-icon name="heart" id="heart"
                              onClick={addOrRemove}
                              style={user.playlist[0].songs.includes(props.playlist[props.index].id) ? {color: "red"} : {color: "#fff"}}
                        ></ion-icon>
                        <AddToPlaylist id={props.playlist[props.index].id} user={user}/>
                        <ion-icon name="scan-outline" id="scan" onClick={() => playerActiveCondition(true)}></ion-icon>
                    </div>
                    <div className="song_volume">
                        <ion-icon name="volume-off-outline"></ion-icon>
                        <div className="volume_progress" onMouseDown={(e) => changeVolume(e)}>
                            <div className="volume_progress_bar"></div>
                        </div>
                        <ion-icon name="volume-high-outline"></ion-icon>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Player;