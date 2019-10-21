import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class WholeSite extends React.Component {
	render() {
		return (
			<React.Fragment>
				<div id="spotifyLogin">
					<SpotifyLogin />
				</div>
				<div id="playlistBuilder">
					<PlaylistBuilder />
				</div>
			</React.Fragment>
			//<SpotifyLogin />
		);
	}
}

class PlaylistBuilder extends React.Component {
	constructor(props) {
		super(props);
		this.state = {mainArtistTracks:[],
					mainArtistSimilarArtists:[],
					currentMainArtist:"",
					mainArtistData:{},
					spiderLegShow:false,
					spiderLeg:[{"left": "55%", "top": "6%", "leftAnchor": "63%", "topAnchor": "8%", "artistName": "", "artistID": 0},
								{"left": "30%", "top": "5%", "leftAnchor":"38%", "topAnchor":"7%", "artistName": "", "artistID": 0},
								{"left": "60%", "top": "12%", "leftAnchor":"68%", "topAnchor":"14%", "artistName": "", "artistID": 0},
								{"left": "70%", "top": "30%", "leftAnchor":"78%", "topAnchor":"32%", "artistName": "", "artistID": 0},
								{"left": "81%", "top": "40%", "leftAnchor":"89%", "topAnchor":"42%", "artistName": "", "artistID": 0},
								{"left": "27%", "top": "30%", "leftAnchor":"35%", "topAnchor":"32%", "artistName": "", "artistID": 0},
								{"left": "40%", "top": "20%", "leftAnchor":"48%", "topAnchor":"22%", "artistName": "", "artistID": 0},
								{"left": "50%", "top": "30%", "leftAnchor":"58%", "topAnchor":"32%", "artistName": "", "artistID": 0},
								{"left": "78%", "top": "8%", "leftAnchor":"86%", "topAnchor":"10%", "artistName": "", "artistID": 0},
								{"left": "29%", "top": "60%", "leftAnchor":"37%", "topAnchor":"62%", "artistName": "", "artistID": 0},
								{"left": "82%", "top": "68%", "leftAnchor": "90%", "topAnchor": "70%", "artistName": "", "artistID": 0},
								{"left": "26%", "top": "90%", "leftAnchor": "34%", "topAnchor": "92%", "artistName": "", "artistID": 0},
								{"left": "80%", "top": "76%", "leftAnchor":"88%", "topAnchor":"78%", "artistName": "", "artistID": 0}
								],
					playlistName:"",
					playlistSongs:[],
					currentSearchIndex:0,
					userID:"",
					playlistID:"",
					lastCreatedPlaylistName: "",
					playlistButtonPrompt: "Create Playlist",
					playlistTrackIDGen: 0
					};
		this.mainArtistChange = this.mainArtistChange.bind(this);
		this.mainArtistSubmit = this.mainArtistSubmit.bind(this);
		this.searchAPI = this.searchAPI.bind(this);
		this.artistTopTracksAPI = this.artistTopTracksAPI.bind(this);
		this.artistSimilarArtistsAPI = this.artistSimilarArtistsAPI.bind(this);
		this.artistGetAllData = this.artistGetAllData.bind(this);
		this.processArtistData = this.processArtistData.bind(this);
		this.setNewArtist = this.setNewArtist.bind(this);
		this.playlistNameChange = this.playlistNameChange.bind(this);
		this.submitSong = this.submitSong.bind(this);
		this.tryNextArtist = this.tryNextArtist.bind(this);
		this.createPlaylist = this.createPlaylist.bind(this)
		this.addTracksToPlaylist = this.addTracksToPlaylist.bind(this);
		this.respondToNewPlaylistID = this.respondToNewPlaylistID.bind(this);
		this.removeTrackFromPlaylist = this.removeTrackFromPlaylist.bind(this);
	}
	
	componentDidMount() {
		if (this.state.userID === "") {
			this.getCurrentUserID();
		}
	}
	
	mainArtistChange(mainArtistVal) {
		this.setState({currentMainArtist: mainArtistVal});
	}
	
	mainArtistSubmit(mainArtistVal) {
		this.setState({spiderLegShow: true, currentSearchIndex: 0});
		this.searchAPI(this.state.currentMainArtist);
	}
	
	playlistNameChange(playlistName) {
		if (this.state.lastCreatedPlaylistName == playlistName) {
			this.setState({playlistName: playlistName, playlistButtonPrompt: "Update Playlist"});
		}
		else {
			this.setState({playlistName: playlistName, playlistButtonPrompt: "Create Playlist"});
		}
	}
	
	getCurrentUserID() {
		fetch("https://api.spotify.com/v1/me", {
			method:'get',
			headers: {
				'Authorization': 'Bearer ' + getHashParam("access_token")
			},
			json: true
		}).then(response => response.json()).then((response) => {this.setState({userID: response["id"]});});
	}
	
	createPlaylist() {
		if (this.state.playlistName != this.state.lastCreatedPlaylistName) {
			this.setState({lastCreatedPlaylistName: this.state.playlistName, playlistButtonPrompt: "Update Playlist"});
			fetch("https://api.spotify.com/v1/users/"+this.state.userID+"/playlists", {
				method:'post',
				headers: {
					'Authorization': 'Bearer ' + getHashParam("access_token"),
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					'name': this.state.playlistName,
					'public': false
				})
			}).then(response => response.json()).then((response) => {this.respondToNewPlaylistID(response["id"])});
		}
		else {
			var tempArray = [];
			for (var i=0; i< this.state.playlistSongs.length; i++) {
				tempArray.push(this.state.playlistSongs[i]["uri"]);
			}
			
			fetch("https://api.spotify.com/v1/playlists/"+this.state.playlistID+"/tracks", {
				method: 'put',
				headers: {
					'Authorization': 'Bearer ' + getHashParam("access_token"),
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
				'uris': tempArray
				})
			});
		}
	}
	
	respondToNewPlaylistID(id) {
		this.setState({playlistID: id});
		this.addTracksToPlaylist(id);
	}
	
	addTracksToPlaylist(id) {
		var tempArray = [];
		for (var i=0; i< this.state.playlistSongs.length; i++) {
			tempArray.push(this.state.playlistSongs[i]["uri"]);
		}
		fetch("https://api.spotify.com/v1/playlists/"+id+"/tracks", {
			method:'post',
			headers: {
				'Authorization': 'Bearer ' + getHashParam("access_token"),
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				'uris': tempArray
			})
		})
	}
	
	searchAPI(searchTerm) {
		fetch("https://api.spotify.com/v1/search?q="+encodeURIComponent(searchTerm)+"&type=artist&limit=5", {
			method: 'get',
			headers: {
				'Authorization': 'Bearer ' + getHashParam("access_token")
			},
			json: true
		}).then(response => response.json()).then((response) => {this.processArtistData(response, 0);});
	}
	
	artistSimilarArtistsAPI(id) {
		fetch("https://api.spotify.com/v1/artists/"+encodeURIComponent(id)+"/related-artists?market=from_token", {
			method: 'get',
			headers: {
				'Authorization': 'Bearer ' + getHashParam("access_token")
			},
			json: true
		}).then(response => response.json()).then((response) => {this.setState({mainArtistSimilarArtists: response["artists"],
																spiderLeg: [{"left": "55%", "top": "6%", "leftAnchor": "63%", "topAnchor": "8%", "artistName": response["artists"][0] ? response["artists"][0]["name"] : "", "artistID": response["artists"][0] ? response["artists"][0]["id"] : ""},
																			{"left": "30%", "top": "5%", "leftAnchor": "38%", "topAnchor": "7%", "artistName": response["artists"][1] ? response["artists"][1]["name"] : "", "artistID": response["artists"][1] ? response["artists"][1]["id"] : ""},
																			{"left": "60%", "top": "12%", "leftAnchor": "68%", "topAnchor": "14%", "artistName": response["artists"][2] ? response["artists"][2]["name"] : "", "artistID": response["artists"][2] ? response["artists"][2]["id"] : ""},
																			{"left": "70%", "top": "30%", "leftAnchor": "78%", "topAnchor": "32%", "artistName": response["artists"][3] ? response["artists"][3]["name"] : "", "artistID": response["artists"][3] ? response["artists"][3]["id"] : ""},
																			{"left": "81%", "top": "40%", "leftAnchor":"89%", "topAnchor":"42%", "artistName": response["artists"][4] ? response["artists"][4]["name"] : "", "artistID": response["artists"][4] ? response["artists"][4]["id"] : ""},
																			{"left": "27%", "top": "30%", "leftAnchor": "35%", "topAnchor": "32%", "artistName": response["artists"][5] ? response["artists"][5]["name"] : "", "artistID": response["artists"][5] ? response["artists"][5]["id"] : ""},
																			{"left": "40%", "top": "20%", "leftAnchor": "48%", "topAnchor": "22%", "artistName": response["artists"][6] ? response["artists"][6]["name"] : "", "artistID": response["artists"][6] ? response["artists"][6]["id"] : ""},
																			{"left": "50%", "top": "30%", "leftAnchor": "58%", "topAnchor": "32%", "artistName": response["artists"][7] ? response["artists"][7]["name"] : "", "artistID": response["artists"][7] ? response["artists"][7]["id"] : ""},
																			{"left": "78%", "top": "8%", "leftAnchor": "86%", "topAnchor": "10%", "artistName": response["artists"][8] ? response["artists"][8]["name"] : "", "artistID": response["artists"][8] ? response["artists"][8]["id"] : ""},
																			{"left": "29%", "top": "60%", "leftAnchor":"37%", "topAnchor":"62%", "artistName": response["artists"][9] ? response["artists"][9]["name"] : "", "artistID": response["artists"][9] ? response["artists"][9]["id"] : ""},
																			{"left": "82%", "top": "68%", "leftAnchor": "90%", "topAnchor": "70%", "artistName": response["artists"][10] ? response["artists"][10]["name"] : "", "artistID": response["artists"][10] ? response["artists"][10]["id"] : ""},
																			{"left": "26%", "top": "90%", "leftAnchor": "34%", "topAnchor": "92%", "artistName": response["artists"][11] ? response["artists"][11]["name"] : "", "artistID": response["artists"][11] ? response["artists"][11]["id"] : ""},
																			{"left": "80%", "top": "76%", "leftAnchor": "88%", "topAnchor": "78%", "artistName": response["artists"][12] ? response["artists"][12]["name"] : "", "artistID": response["artists"][12] ? response["artists"][12]["id"] : ""}]});});
	}
	
	setNewArtist(id, name) {
		this.setState({currentMainArtist: name});
		this.artistGetAllData(id);
	}
	
	artistTopTracksAPI(id) {
		fetch("https://api.spotify.com/v1/artists/"+encodeURIComponent(id)+"/top-tracks?market=from_token", {
			method: 'get',
			headers: {
				'Authorization': 'Bearer ' + getHashParam("access_token")
			},
			json: true
		}).then(response => response.json()).then(response => {this.setState({mainArtistTracks: response["tracks"]});});
	}
	
	artistGetAllData(id) {
		this.artistSimilarArtistsAPI(id);
		this.artistTopTracksAPI(id);
	}
	
	processArtistData(response, n) {
		this.setState({mainArtistSearchData: response["artists"]["items"], currentMainArtist: response["artists"]["items"][n]["name"]});
		this.artistGetAllData(response["artists"]["items"][n]["id"]);
	}
	
	submitSong(artist, title, uri) {
		const newArray = this.state.playlistSongs;
		newArray.push({"artist":artist, "title":title, "uri":uri, "id":this.state.playlistTrackIDGen});
		this.setState({playlistSongs: newArray, playlistTrackIDGen: this.state.playlistTrackIDGen + 1});
	}
	
	tryNextArtist() {
		var searchIndex = this.state.currentSearchIndex;
		searchIndex++;
		this.setState({currentMainArtist: this.state.mainArtistSearchData[searchIndex]["name"], currentSearchIndex: searchIndex});;
		this.artistGetAllData(this.state.mainArtistSearchData[searchIndex]["id"]);
	}
	
	renderSpiderLeg(i) {
		return (
		  <SpiderLeg
			info={this.state.spiderLeg[i]}
			setNewArtist={this.setNewArtist}
			spiderLegShow={this.state.spiderLegShow}
		  />
		);
	}
	
	removeTrackFromPlaylist(id) {
		this.setState({playlistSongs: removeObjectWithValue(this.state.playlistSongs, "id", id)});
	}
	
	render() {		
		return (
			<div>
			<PlaylistArea playlistName={this.state.playlistName}
			playlistNameChange={this.playlistNameChange}
			playlistSongs={this.state.playlistSongs}
			createPlaylist={this.createPlaylist}
			playlistButtonPrompt={this.state.playlistButtonPrompt}
			removeTrackFromPlaylist={this.removeTrackFromPlaylist}
			/>
			<div>
			{this.renderSpiderLeg(0)}
			{this.renderSpiderLeg(1)}
			{this.renderSpiderLeg(2)}
			{this.renderSpiderLeg(3)}
			{this.renderSpiderLeg(4)}
			{this.renderSpiderLeg(5)}
			{this.renderSpiderLeg(6)}
			{this.renderSpiderLeg(7)}
			{this.renderSpiderLeg(8)}
			{this.renderSpiderLeg(9)}
			{this.renderSpiderLeg(10)}
			{this.renderSpiderLeg(11)}
			{this.renderSpiderLeg(12)}
			</div>
			<MainArtistForm currentMainArtist={this.state.currentMainArtist} 
			mainArtistTracks={this.state.mainArtistTracks}
			mainArtistChange={this.mainArtistChange}
			mainArtistSubmit={this.mainArtistSubmit}
			currentSearch={this.state.currentMainArtist}
			spiderLegShow={this.state.spiderLegShow}
			submitSong={this.submitSong}
			playlistSongs={this.state.playlistSongs}
			tryNextArtist ={this.tryNextArtist}
			/>
			</div>
		)
	}
}

class SpiderLeg extends React.Component {
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}
	
	handleClick(event) {
		this.props.setNewArtist(this.props.info["artistID"], this.props.info["artistName"]);
	}
	
	render() {
		return (
			<div className= {this.props.spiderLegShow ? "" : "hidden"}>
			<button onClick={this.handleClick} className="otherArtistButton" artistid={this.props.info["artistID"]} style={{left: this.props.info["left"], top: this.props.info["top"]}}>{this.props.info["artistName"]}</button>
			<svg className="spiderLegConnector"><line x1={this.props.info["leftAnchor"]} x2="60%" y1={this.props.info["topAnchor"]} y2="46%"/></svg>
			</div>
		)
	}
}

class MainArtistForm extends React.Component {
	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleWrongArtist = this.handleWrongArtist.bind(this);
  }
  
  handleSubmit(event) {
    event.preventDefault();
	this.props.mainArtistSubmit(this.props.currentMainArtist);
  }
  
  handleChange(event) {
    this.props.mainArtistChange(event.target.value);
  }
  
  handleWrongArtist(event) {
	  this.props.tryNextArtist();
  }
	
	render() {
		return (
			<div id="mainArtist">
				<form onSubmit={this.handleSubmit}>
					<input id="mainArtistInput"
					value={this.props.currentMainArtist} 
					type="text"
					onChange={this.handleChange}
					placeholder="Enter Artist Here"/>
					<div id="mainArtistTracks" className={this.props.spiderLegShow ? "" : "hidden"}>
						<ArtistSongList 
						mainArtistTracks={this.props.mainArtistTracks} 
						submitSong={this.props.submitSong}
						artist={this.props.currentMainArtist}
						playlistSongs={this.props.playlistSongs}
						/>
					</div>
				</form>
				<button className="mainArtistButton" onClick={this.handleSubmit}>Search</button>
				<button className="mainArtistButton" onClick={this.handleWrongArtist}>Wrong Artist</button>
			</div>
		);
	}
}

class ArtistSongList extends React.Component {
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}
	
	handleClick(artist, track, uri) {
		this.props.submitSong(artist, track, uri);
	}
	
	render () {
		return (
			 <div>
				<table id='mainArtistTrackTable'>
					<colgroup>
					<col className="mainArtistSongTitleColumn" />
					<col className="mainArtistButtonColumn" />
					</colgroup>
					<tbody>
						{this.props.mainArtistTracks.map(mainArtistTracks => <tr onClick={()=> this.handleClick(this.props.artist, mainArtistTracks["name"], mainArtistTracks["uri"])} artist={this.props.artist} uri={mainArtistTracks["uri"]} key={mainArtistTracks["id"]} className="mainArtistTrackTableRow"><td className="mainArtistTrackTableCellName">{mainArtistTracks["name"]}</td><td className="mainArtistPlusColumn">+</td></tr>)}
					</tbody>
				</table>
			 </div>
		)
	}
}

class PlaylistArea extends React.Component {
	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
  }
  
  handleSubmit(event) {
    event.preventDefault();
	this.props.createPlaylist();
  }
  
  handleChange(event) {
    this.props.playlistNameChange(event.target.value);
  }
	
	render() {
		return (
			<div id="playListArea">
				<form>
					<input id="playlistNameInput"
					value={this.props.playlistName} 
					type="text"
					onChange={this.handleChange}
					placeholder="Enter Playlist Name Here"/>
					<PlaylistSongList 
					playlistSongs={this.props.playlistSongs}
					removeTrackFromPlaylist={this.props.removeTrackFromPlaylist}
					/>
				</form>
				<button onClick={this.handleSubmit} id="playlistSubmit">{this.props.playlistButtonPrompt}</button>
			</div>
		);
	}
}

class PlaylistSongList extends React.Component {
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}
	
	handleClick(id) {
		this.props.removeTrackFromPlaylist(id);
	}
	
	render () {
		return (
			 <div>
				<table id='playlistTrackTable'>
					<colgroup>
					<col className="playlistSongTitleColumn" />
					<col className="playlistMinusColumn" />
					</colgroup>
					<tbody>
						{this.props.playlistSongs.map(playlistSongs => <tr onClick={()=> this.handleClick(playlistSongs["id"])} artist={playlistSongs["artist"]} uri={playlistSongs["uri"]}  className="playlistTrackTableRow"><td className="playlistSongTitleColumn">{playlistSongs["artist"]+": "+playlistSongs["title"]}</td><td className="playlistMinusColumn">-</td></tr>)}
					</tbody>
				</table>
			 </div>
		)
	}
}

const stateKey = "spotify_auth_state";
class SpotifyLogin extends React.Component {
  componentDidMount() {
    localStorage.removeItem(stateKey);
  }

  handleClick = () => {
    const client_id = "8f8783f95ca7449fbb4bb5ac6f84840b";
    const redirect_uri = "https://levelupjordan.github.io/third-attempt/";
    const scope = "playlist-modify-private";
    const state = generateRandomString(16);
    localStorage.setItem(stateKey, state);
    const url = `https://accounts.spotify.com/authorize?response_type=token&client_id=${encodeURIComponent(client_id)}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${encodeURIComponent(state)}&scope=${encodeURIComponent(scope)}`;
    window.location = url;
  };

  render() {
    return <button onClick={this.handleClick}>Log in</button>;
  }
};

function generateRandomString(length) {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  while (text.length <= length) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

function getHashParam(param) {
	var hash = window.location.hash.substr(1);

	var result = hash.split('&').reduce(function (result, item) {
		var parts = item.split('=');
		result[parts[0]] = parts[1];
		return result;
	}, {});
	return result[param]
};

function addStringPercents(percent1, percent2) {
	var percent1Num = parseInt(percent1.replace("%",""));
	var percent2Num = parseInt(percent2.replace("%",""));
	var totalPercentNum = percent1Num+percent2Num;
	return totalPercentNum+"%"
}

function removeObjectWithValue(array, key, val) {
	for (var i=0; i<array.length; i++) {
		if (array[i][key] == val) {
			array.splice(i, 1);
			return array
		}
	}
}

ReactDOM.render(
  <WholeSite />,
  document.getElementById('root')
);