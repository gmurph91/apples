import React, { Component } from 'react';
import './App.css';
import openSocket from 'socket.io-client';
import Card from './components/card';
import Cardtwo from './components/cardtwo';
import Select from 'react-select'
const socket = openSocket('https://gregapis.herokuapp.com');
const axios = require('axios')
require('dotenv').config()
const options = [
  { value: 'Apples to Apples', label: `Apples to Apples` },
  { value: 'Cards Against Humanity', label: `Cards Against Humanity` },
];

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
        name: "",
        joinCode: "",
        green: [],
        red: [],
        greens: [],
        reds: [],
        currentGreen: "",
        black: [],
        white: [],
        blacks: [],
        whites: [],
        currentBlack: "",
        hand: [],
        judge: "",
        judging: false,
        entries: [],
        entered: false,
        players: [],
        who: [],
        scores:[0],
        welcome: true,
        selectedOption: { value: "Apples to Apples", label: "Apples to Apples" },
        selected: "Apples to Apples",
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }


  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
    window.addEventListener('scroll', this.handleScroll);
    this.handleResize()
    this.welcome()
    let room = this.state.joinCode
    socket.on('connect', function() {
      socket.emit('room', room);
   });
    socket.on('join game',(user) =>{
      this.setState({ players: [...this.state.players, user.name] });
      this.setState({ scores: [...this.state.scores, 0] });
      socket.emit('existing players', { room: this.state.joinCode, players: this.state.players, judge:this.state.judge, scores:this.state.scores });
      if(this.state.judge === ""){
      this.selectJudge()
    }
  })
    socket.on('existing players',(players) =>{
      this.setState({
        players: players.players,
        judge: players.judge,
        scores: players.scores
      })
    })
    socket.on('judge',(judge) =>{
      this.setState({
        judge: judge.judge
      })
      if(this.state.judge === this.state.name){
        this.setState({
          judging:true
        })
      }
    })
    socket.on('winner',(winner) =>{
      let players = this.state.players
      const index = players.indexOf(winner.winner);
      let scores = [...this.state.scores];
      let score = {...scores[index]};
      score = scores[index]+1;
      scores[index] = score;
    this.setState({scores});
      this.setState({
        entries: [],
        who: [],
        judging: false,
        entered: false,
      })
    })
    socket.on('remove reds',(cards) =>{
      if(this.state.selected==="Apples to Apples"){
        let deck = this.state.reds
        let hand = cards.hand
      hand.map((hand, i) => {
        const index = deck.indexOf(hand);
        if (index > -1) {
          deck.splice(index, 1);
        }
        return hand
      })
      } else if(this.state.selected==="Cards Against Humanity"){
        let deck = this.state.whites
        let hand = cards.hand
        hand.map((hand, i) => {
          const index = deck.indexOf(hand);
          if (index > -1) {
            deck.splice(index, 1);
          }
          return hand
        })}
    })
    socket.on('green card',(card) =>{
      this.setState({
        currentGreen: card.card,
        currentBlack: card.card
      })
    })
    socket.on('red card',(card) =>{
      this.setState({ entries: [...this.state.entries, card.card] });
      this.setState({ who: [...this.state.who, card.name] });
      if(this.state.entries.length === this.state.players.length-1){
        this.setState({judging:true})
      }
    })
  }

  componentDidUpdate(){
   this.handleResize()
   this.loading()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
    window.removeEventListener('scroll', this.handleScroll);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  handleResize = () => {
    let width = this.state.width
    let app = document.getElementById("app");
    if (width <=600){
      app.classList.add("mobile");
      app.classList.remove("small");
      app.classList.remove("large");
    }
    if (width >600 && width <= 1000) {
      app.classList.add("small");
      app.classList.remove("mobile");
      app.classList.remove("large");
    }
    else if (width>1000) { 
      app.classList.add("large");
      app.classList.remove("mobile");
      app.classList.remove("small");
    }
  }

  loading = () => {
    var element = document.getElementById("loadingIcon")
    if (this.state.loading) {
      element.classList.remove("hide")
      document.getElementById("header").classList.add("hide")
      document.getElementById("board").classList.add("hide")
      document.getElementById("infobox").classList.add("hide")
    } else {
      element.classList.add("hide")
      document.getElementById("header").classList.remove("hide")
      document.getElementById("board").classList.remove("hide")
      document.getElementById("infobox").classList.remove("hide")
    }
  }

  welcome = () => {
    if (this.state.welcome === true) {
      document.getElementById("header").classList.add("hide2")
    } else {
      document.getElementById("header").classList.remove("hide2")
    }
  }

  selectJudge = () => {
    for (let step = 0; step < 1; step++) {
      let players = this.state.players
      let find = players[Math.floor(Math.random() * players.length)]
      this.setState({ judge: find });
      socket.emit('judge', { room: this.state.joinCode, judge: this.state.judge });
    }
  }

  newRound = async () => {
    if(this.state.selected==="Apples to Apples"){
    for (let step = 0; step < 1; step++) {
      let greens = this.state.greens
      let find = greens[Math.floor(Math.random() * greens.length)]
      this.setState({ currentGreen: find });
      const index = greens.indexOf(find);
      if (index > -1) {
        greens.splice(index, 1);
      }
    }
    await this.setState({})
    socket.emit('green card', { room: this.state.joinCode, card: this.state.currentGreen });
    this.selectJudge()
  } else if(this.state.selected==="Cards Against Humanity"){
    for (let step = 0; step < 1; step++) {
      let blacks = this.state.blacks
      let find = blacks[Math.floor(Math.random() * blacks.length)]
      this.setState({ currentBlack: find });
      const index = blacks.indexOf(find);
      if (index > -1) {
        blacks.splice(index, 1);
      }
    }
    await this.setState({})
    socket.emit('green card', { room: this.state.joinCode, card: this.state.currentBlack });
    this.selectJudge()
  }}

  getCards = async () => {
    try {
      const green = await axios.get(`https://gregapis.herokuapp.com/apples/green`);
      const red = await axios.get(`https://gregapis.herokuapp.com/apples/red`);
      this.setState({
        green: await green.data,
        red: await red.data,
      })
    } catch (err) {
      console.log(err);
    }
    await this.setState({})
    this.disperseCards()
  }

  getCards2 = async () => {
    try {
      const black = await axios.get(`https://gregapis.herokuapp.com/apples/black`);
      const white = await axios.get(`https://gregapis.herokuapp.com/apples/white`);
      this.setState({
        black: await black.data,
        white: await white.data,
      })
    } catch (err) {
      console.log(err);
    }
    await this.setState({})
    this.disperseCards2()
  }

  selector = async selectedOption => {
    this.setState(
      { selectedOption },
    )
    this.setState({
      selected: selectedOption.value,
    })
    await (this.setState({ selectedOption })) 
  }

  disperseCards = async () => {
    let green = this.state.green
    let red = this.state.red
    green.map((green, i) => {
      this.setState({ greens: [...this.state.greens, green.word] });
      return green
    })
    red.map((red, i) => {
      this.setState({ reds: [...this.state.reds, red.word] });
      return red
    })
    await this.setState({})
    for (let step = 0; step < 1; step++) {
      let greens = this.state.greens
      let find = greens[Math.floor(Math.random() * greens.length)]
      this.setState({ currentGreen: find });
      const index = greens.indexOf(find);
      if (index > -1) {
        greens.splice(index, 1);
      }
    }
    for (let step = 0; step < 7; step++) {
      let reds = this.state.reds
      let find = reds[Math.floor(Math.random() * reds.length)]
      this.setState({ hand: [...this.state.hand, find]});
      const index = reds.indexOf(find);
      if (index > -1) {
        reds.splice(index, 1);
      }
    }
    this.setState({
      loading: false,
    })
    try {
      const apiCall = await axios.post('https://gregapis.herokuapp.com/apples/newgame', {
        joinCode: this.state.joinCode,
        greens: this.state.greens,
        reds: this.state.reds,
        currentGreen: this.state.currentGreen,
        selected: this.state.selected
      })
      await apiCall
    } catch (err) {
      console.log(err)
  }
  }

  disperseCards2 = async () => {
    let black = this.state.black
    let white = this.state.white
    black.map((black, i) => {
      this.setState({ blacks: [...this.state.blacks, black.prompt] });
      return black
    })
    white.map((white, i) => {
      this.setState({ whites: [...this.state.whites, white.response] });
      return white
    })
    await this.setState({})
    for (let step = 0; step < 1; step++) {
      let blacks = this.state.blacks
      let find = blacks[Math.floor(Math.random() * blacks.length)]
      this.setState({ currentBlack: find });
      const index = blacks.indexOf(find);
      if (index > -1) {
        blacks.splice(index, 1);
      }
    }
    for (let step = 0; step < 8; step++) {
      let whites = this.state.whites
      let find = whites[Math.floor(Math.random() * whites.length)]
      this.setState({ hand: [...this.state.hand, find]});
      const index = whites.indexOf(find);
      if (index > -1) {
        whites.splice(index, 1);
      }
    }
    this.setState({
      loading: false,
    })
    try {
      const apiCall = await axios.post('https://gregapis.herokuapp.com/apples/newgame', {
        joinCode: this.state.joinCode,
        blacks: this.state.blacks,
        whites: this.state.whites,
        currentBlack: this.state.currentBlack,
        selected: this.state.selected
      })
      await apiCall
    } catch (err) {
      console.log(err)
  }
  }

  getHand = async () => {
    if (this.state.selected === "Apples to Apples"){
    let reds = this.state.reds
    for (let step = 0; step < 7; step++) {
      let find = reds[Math.floor(Math.random() * reds.length)]
      this.setState({ hand: [...this.state.hand, find]});
      const index = reds.indexOf(find);
      if (index > -1) {
        reds.splice(index, 1);
      }
    }} else if (this.state.selected === "Cards Against Humanity"){
      let whites = this.state.whites
    for (let step = 0; step < 8; step++) {
      let find = whites[Math.floor(Math.random() * whites.length)]
      this.setState({ hand: [...this.state.hand, find]});
      const index = whites.indexOf(find);
      if (index > -1) {
        whites.splice(index, 1);
      }
    }
    }
    socket.emit('remove reds', { room: this.state.joinCode, hand: this.state.hand });
    this.setState({
      loading: false,
    })
  }

  sendEvent = (event) => {
    try{
      if(this.state.entered===false && this.state.judging===false){
      // document.getElementById(`${event.currentTarget.id}`).remove();
      this.setState({
        entered: true,
      })
      let hand = this.state.hand
      const index = hand.indexOf(event.currentTarget.id);
      if (index > -1) {
        hand.splice(index, 1);
      }
      socket.emit('red card', { room: this.state.joinCode, card: event.currentTarget.id, name: this.state.name });
      this.getOneCard()}
      else {console.log("already entered")}
    } catch (e) {console.log(e)}
  }

  getOneCard = () => {
    if(this.state.selected==="Apples to Apples"){
      let reds = this.state.reds
      let find = reds[Math.floor(Math.random() * reds.length)]
      this.setState({ hand: [...this.state.hand, find]});
      const index = reds.indexOf(find);
      if (index > -1) {
        reds.splice(index, 1);
      }} else if (this.state.selected === "Cards Against Humanity") {
        let whites = this.state.whites
      let find = whites[Math.floor(Math.random() * whites.length)]
      this.setState({ hand: [...this.state.hand, find]});
      const index = whites.indexOf(find);
      if (index > -1) {
        whites.splice(index, 1);
      }
      }
  }

  redMap = () => {
    return this.state.hand.map((card, i) => {
      return <Card key={i} card={card} selectHandler={this.sendEvent}/>
    })
  }

  whiteMap = () => {
    return this.state.hand.map((card, i) => {
      return <Cardtwo key={i} card={card} selectHandler={this.sendEvent}/>
    })
  }

  redEntries = () => {
    return this.state.entries.map((card, i) => {
      return <Card key={i} card={card} selectHandler={this.selectWinner}/>
    })
  }

  whiteEntries = () => {
    return this.state.entries.map((card, i) => {
      return <Cardtwo key={i} card={card} selectHandler={this.selectWinner}/>
    })
  }

  playerMap = () => {
    let scores = this.state.scores
    return this.state.players.map((player, i) => {
      return <li key={i} className="scoreList">{player}: {scores[i]}</li>
    })
  }

  renderBoard = () => {
    const { selectedOption } = this.state;
    if(this.state.welcome===true){
      return <div id="welcome">
          <div>
            <h1 className="welcomeHeader">Welcome</h1>
            <form className="welcomeForm" autoComplete="off">
            <label htmlFor="username">Name:</label>
            <input id="username" type="text" value={this.state.name} onChange={(event)=>{
              this.setState({
                name: event.target.value
              })
            }}/>
            <label htmlFor="joinCode">Join Code:</label>
            <input id="joinCode" type="text" value={this.state.joinCode} onChange={(event)=>{
              this.setState({
                joinCode: event.target.value
              })
            }}/>
            <Select
            value={selectedOption}
            onChange={this.selector}
            options={options}
            className={"sortSelect"}
            classNamePrefix={"sortSelect"}
          />
              <div className="buttons">
              <input type="button" className="welcomeButton" onClick={this.newGame} value="New" id="New"/>
              <input type="button" className="welcomeButton" onClick={this.joinGame} value="Join" id="Join"/>
              </div>
            </form>
            </div>
        </div>
    }
    else if (this.state.selected==="Apples to Apples" && this.state.judging === false && this.state.welcome === false){
      return <div><div className="greenRow">
      <div className="greenCard"><p>{this.state.currentGreen}</p></div>
      </div>
      <div className="redRow">{this.redMap()}</div>
      </div>
    } else if(this.state.selected==="Cards Against Humanity" && this.state.judging === false && this.state.welcome === false) {
      return <div><div className="blackRow">
      <div className="blackCard"><p>{this.state.currentBlack}</p></div>
      </div>
      <div className="whiteRow">{this.whiteMap()}</div>
      </div>
    } else if (this.state.selected==="Apples to Apples" && this.state.judging === true && this.state.welcome === false){
      return <div><div className="greenRow">
      <div className="greenCard"><p>{this.state.currentGreen}</p></div>
      </div>
      <div className="redRow">{this.redEntries()}</div>
      </div>
    } else if(this.state.selected==="Cards Against Humanity" && this.state.judging === true && this.state.welcome === false) {
      return <div><div className="blackRow">
      <div className="blackCard"><p>{this.state.currentBlack}</p></div>
      </div>
      <div className="whiteRow">{this.whiteEntries()}</div>
      </div>
    }
  }

  newGame = async () => {
    let name = this.state.name
    let joinCode = this.state.joinCode
    let selected = this.state.selected
    if(name === "" || joinCode === ""){
      alert("Please fill out all fields")
    } else {
      if(selected === "Apples to Apples"){
    this.getCards()
  } else if(selected === "Cards Against Humanity"){
    this.getCards2()
  }
  this.setState({
    welcome: false,
    loading: true,
    players: [this.state.name]
  })
  await this.setState({})
  this.welcome()
}}

  joinGame = async () => {
    let name = this.state.name
    let joinCode = this.state.joinCode
    if(name === "" || joinCode === ""){
      alert("Please fill out all fields")
    } else {
    try {
      const response = await axios.get(`https://gregapis.herokuapp.com/apples/savedgame/${joinCode}`);
      await response
      if(response.data !== ""){
      this.setState({
        greens: response.data.greens,
        reds: response.data.reds,
        currentGreen: response.data.currentGreen,
        whites: response.data.whites,
        blacks: response.data.blacks,
        currentBlack: response.data.currentBlack,
        selected: response.data.selected,
        welcome: false,
        loading: true,
        players: [this.state.name]
      })
      await this.setState({})
      this.welcome()
      this.getHand()
      socket.emit('join game', { room: this.state.joinCode, name: this.state.name });
    }
      else {alert("Unable to join game.  Check your join code and try again")}
    } catch (err) {
      console.log(err)
    }}
  }

  doWhat = () => {
    if (this.state.judging===false && this.state.name!==this.state.judge){
      return "Pick a card"
    } else if (this.state.judging===true && this.state.name!==this.state.judge){ return `${this.state.judge} is choosing a winner!`}
    else if (this.state.judging===true && this.state.name===this.state.judge){ return `Choose the winner!`}
  }

  selectWinner = (event) => {
    if(this.state.name===this.state.judge){
      let entries = this.state.entries
      let who = this.state.who
      const index = entries.indexOf(event.currentTarget.id);
    socket.emit('winner', { room: this.state.joinCode, winner: who[index]});
    this.newRound()
    } else {console.log("you are not the judge")}
  }

  render() {
    return (
      <div className="App" id="app">
        <div className="header hide" id="header">
          <h2>{this.state.selected}</h2>
        </div>
            <div id="board">
              {this.renderBoard()}
              <p className="dothis">{this.doWhat()}</p>
              </div>
            <div className="information" id="infobox">
            <h2>Info</h2>
            <p>Judge: {this.state.judge}</p>
            <p>Scores: {this.playerMap()}</p>
            </div>
            
        <img id="loadingIcon" src="loading.gif" alt="loading" />
        </div>
        
    )}}
  
