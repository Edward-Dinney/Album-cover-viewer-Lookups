import React, { useState, useEffect } from 'react';
import "./App.css";
import logo from './components/logo.png';
import download from './components/download.png';
import add from './components/add.png'
import lookloader from './components/looking.gif';

const SpotifyAlbums = () => {
    const [searchInput, setSearchInput] = useState("");
    const [albums, setAlbums] = useState([]);
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowsuggestions] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState(null);
    const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

    useEffect(() => {
        var authParameters = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
        }
        fetch('https://accounts.spotify.com/api/token', authParameters)
            .then(result => result.json())
            .then(data => setToken(data.access_token))
    }, []);
    async function search(){
        setLoading(true);
        const searchParameters = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        };

        const artistID = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=artist', searchParameters)
            .then(response => response.json())
            .then(data => {return data.artists.items[0].id})
        console.log("art:" + artistID);

        const albums = await fetch('https://api.spotify.com/v1/artists/' + artistID + '/albums?limit=50', searchParameters)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setAlbums(data.items);
            });
        setLoading(false);
    } 
    async function fetchSuggestions(query) {
        if (!query || query.length < 2){
            setSuggestions([]);
            return;
        }

        const searchParameters = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        };

        try {
            const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=5`,searchParameters);
            const data = await res.json();

            if(!data.artists?.items) {
                setSuggestions([]);
                return;
            }

            setSuggestions(data.artists.items);
            setShowsuggestions(true);
        } catch (err) {
            console.error(err);
            setSuggestions([]);
    }
    }
    async function selectArtist(artist){
        setSearchInput(artist.name);
        setSuggestions([]);
        setShowsuggestions(false);

        setLoading(true);

        const searchParameters = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }; 

        const res = await fetch(`https://api.spotify.com/v1/artists/${artist.id}/albums?limit=50`,searchParameters);
        const data = await res.json();

        setAlbums(data.items);
        setLoading(false);
    }
    const handleChange = (e) => {
        const value = e.target.value;
        setSearchInput(e.target.value);

        if (debounceTimer) clearTimeout(debounceTimer);

        const timer = setTimeout(() => {
            fetchSuggestions(value);
        }, 300);

        setDebounceTimer(timer);
      };
    const handleSubmit = (event) => {
        event.preventDefault();
        search();
      }
    const handleDownload = (url, filename) => {
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                link.remove();
            });
    };
console.log(albums);
return (
<center>
    <div className="bg">
    <img src={logo} alt="Logo" className="logo" onClick={() => window.location.reload()}/>

        <form onSubmit={handleSubmit}>
        <input type="text" 
               placeholder="search music artists"
               value={searchInput} 
               onChange={handleChange}
               onFocus={() => setShowsuggestions(true)}
               onBlur={() => setTimeout(() => setShowsuggestions(false), 200)} 
        />

        {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions">
                {suggestions.map(artist => (
                    <div className="suggestions-name" key={artist.id} onClick={() => selectArtist(artist)} >
                        <span>{artist.name}</span>
                    </div>
                ))}
            </div>
        )}
        </form>

        {loading ? (
        <div className="loader">
            <img src={lookloader} alt="Loading..." className="loader-image" />
        </div>
        ) : (
        <div className="albums-grid">
            {albums.map(album => (
                <div key={album.id} className="album-card">
                    <img src={album.images[0].url} alt={album.name} className="album-image"/>
                    <div className="album-name-wrapper">
                        <span className="album-name">{album.name} {" "}
                        <img 
                            src={download} 
                            alt="download" 
                            className="download" 
                            onClick={() => handleDownload(album.images[0].url, `${album.name.replace(/[^a-z0-9]/gi, '_')}.jpg`)} 
                        />
                        </span> 
                    </div>
                </div>
            ))}
        </div>)}
    </div>
</center>
);
};

export default SpotifyAlbums;

