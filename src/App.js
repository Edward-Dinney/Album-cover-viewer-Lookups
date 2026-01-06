import React, { useState, useEffect } from 'react';
import "./App.css";
import logo from './components/logo.png';
import download from './components/download.png';
import lookloader from './components/looking.gif';

const SpotifyAlbums = () => {
    const [searchInput, setSearchInput] = useState("");
    const [albums, setAlbums] = useState([]);
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
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
        console.log(CLIENT_ID, CLIENT_SECRET);
        setLoading(true);
        var searchParameters = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }
        var artistID = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=artist', searchParameters)
            .then(response => response.json())
            .then(data => {return data.artists.items[0].id})
        console.log("art:" + artistID);

        var albums = await fetch('https://api.spotify.com/v1/artists/' + artistID + '/albums?limit=50', searchParameters)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setAlbums(data.items);
            });
        setLoading(false);
    }  

    const handleChange = (e) => {
        e.preventDefault();
        setSearchInput(e.target.value);
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
            <input type="text" placeholder="search music artists" value={searchInput} onChange={handleChange} />
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
                        <span className="album-name">{album.name} 
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

