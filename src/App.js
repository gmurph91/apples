import React, { Component } from 'react';
import './App.css';
import openSocket from 'socket.io-client';
import Card from './components/card';
const socket = openSocket('https://gregapis.herokuapp.com');
const axios = require('axios')
require('dotenv').config()


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
        hand: [],
        judge: "Greg",
        judging: false,
        entries: [],
        players: [],
        welcome: true,
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
      // Connected, let's sign-up for to receive messages for this room
      socket.emit('room', room);
   });
    socket.on('join game',(user) =>{
      console.log(user.name + " joined game " + user.room)
    })
    socket.on('remove reds',(cards) =>{
      console.log(cards.hand)
    })
    // socket.on('green card',(card) =>{
    //   console.log(card)
    //   // this.setState({
    //   //   currentGreen: card
    //   // })
    // })
    socket.on('red card',(card) =>{
      console.log(card.card)
      // this.setState({ entries: [...this.state.entries, card] });
      // console.log(this.state.entries)
      // try{
      // if(this.state.entries.length > 4){this.setState({judging:true})}
      // } catch(e) {console.log(e)}
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
      document.getElementById("board").classList.add("hide2")
      document.getElementById("infobox").classList.add("hide2")
    } else {
      document.getElementById("welcome").classList.add("hide2")
      document.getElementById("header").classList.remove("hide2")
      document.getElementById("board").classList.remove("hide2")
      document.getElementById("infobox").classList.remove("hide2")
    }
  }

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
    // socket.emit('green card', { room: this.state.joinCode, card: this.state.currentGreen });
    this.setState({
      loading: false,
    })
    try {
      const apiCall = await axios.post('https://gregapis.herokuapp.com/apples/newgame', {
        joinCode: this.state.joinCode,
        greens: this.state.greens,
        reds: this.state.reds,
        currentGreen: this.state.currentGreen,
        players: [this.state.name],
      })
      await apiCall
    } catch (err) {
      console.log(err)
  }
  }

  getHand = async () => {
    let reds = this.state.reds
    for (let step = 0; step < 7; step++) {
      let find = reds[Math.floor(Math.random() * reds.length)]
      this.setState({ hand: [...this.state.hand, find]});
      const index = reds.indexOf(find);
      if (index > -1) {
        reds.splice(index, 1);
      }
    }
    socket.emit('remove reds', { room: this.state.joinCode, hand: this.state.hand });
    this.setState({
      loading: false,
    })
  }

  sendEvent = (event) => {
    try{
      document.getElementById(`${event.currentTarget.id}`).remove();
      // let hand = this.state.hand
      // const index = hand.indexOf(event.currentTarget.id);
      // if (index > -1) {
      //   hand.splice(index, 1);
      // }
      socket.emit('red card', { room: this.state.joinCode, card: event.currentTarget.id });
    this.getOneCard()
    } catch (e) {console.log(e)}
  }

  selectWinner = () => {
    console.log("Winner!")
  }

  getOneCard = () => {
      let reds = this.state.reds
      let find = reds[Math.floor(Math.random() * reds.length)]
      this.setState({ hand: [...this.state.hand, find]});
      const index = reds.indexOf(find);
      if (index > -1) {
        reds.splice(index, 1);
      }
  }

  redMap = () => {
    return this.state.hand.map((card, i) => {
      return <Card key={i} card={card} selectHandler={this.sendEvent}/>
    })
  }

  entryMap = () => {
    return this.state.entries.map((card, i) => {
      return <Card key={i} card={card} selectHandler={this.selectWinner}/>
    })
  }

  renderBoard = () => {
    if (this.state.judging === false){
      return <div><div className="greenRow">
      <div className="greenCard"><p>{this.state.currentGreen}</p></div>
      </div>
      <div className="redRow">{this.redMap()}</div>
      </div>
    } else {
      return <div><div className="greenRow">
      <div className="greenCard"><p>{this.state.currentGreen}</p></div>
      </div>
      <div className="redRow">{this.entryMap()}</div>
      </div>
    }
  }

  newGame = async () => {
    let name = this.state.name
    let joinCode = this.state.joinCode
    if(name === "" || joinCode === ""){
      alert("Please fill out all fields")
    } else {
    this.getCards()
    this.setState({
      welcome: false,
      loading: true,
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
        players: response.data.players,
        welcome: false,
        loading: true,
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

  render() {
    return (
      <div className="App" id="app">
        <div className="header hide" id="header">
          <h2>Apples to Apples</h2>
        </div>
            <div id="board" className="hide">
              {this.renderBoard()}
              </div>
            <div className="information hide" id="infobox">
            <h2>Info</h2>
            <p>Judge: {this.state.judge}</p>
            <p>Scores: </p>
            </div>
            <div id="welcome">
          <div>
            <h1 className="welcomeHeader">Welcome</h1>
            <form className="welcomeForm">
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
              <div className="buttons">
              <input type="button" className="welcomeButton" onClick={this.newGame} value="New" id="New"/>
              <input type="button" className="welcomeButton" onClick={this.joinGame} value="Join" id="Join"/>
              </div>
            </form>
            </div>
        </div>
        <img id="loadingIcon" src="loading.gif" alt="loading" />
        </div>
        
    )}}
  
