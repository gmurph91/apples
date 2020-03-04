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
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }


  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
    window.addEventListener('scroll', this.handleScroll);
    this.handleResize()
    this.getCards()
    socket.on('green card',(card) =>{
      this.setState({
        currentGreen: card
      })
    })
    socket.on('red card',(card) =>{
      this.setState({ entries: [...this.state.entries, card] });
      console.log(this.state.entries)
      try{
      if(this.state.entries.length > 4){this.setState({judging:true})}
      } catch(e) {console.log(e)}
    })
  }

  componentDidUpdate(){
   this.handleResize()
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
    socket.emit('green card', this.state.currentGreen);
  }

  sendEvent = (event) => {
    try{
      document.getElementById(`${event.currentTarget.id}`).remove();
      // let hand = this.state.hand
      // const index = hand.indexOf(event.currentTarget.id);
      // if (index > -1) {
      //   hand.splice(index, 1);
      // }
    socket.emit('red card', event.currentTarget.id);
    this.getOneCard()
    } catch (e) {console.log(e)}
  }

  selectWinner = () => {
    console.log("Winner!")
  }

  getOneCard = () => {
    console.log(this.state)
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

  render() {
    return (
      <div className="App" id="app">
        <div className="header">
          <h2>Apples to Apples</h2>
        </div>
              {/* <img id="loadingIcon" src="loading.gif" alt="loading" /> */}
              {this.renderBoard()}
            <div className="information" id="infobox">
            <h2>Info</h2>
            <p>Judge: {this.state.judge}</p>
            <p>Scores: </p>
            </div>
        </div>
        
    )}}
  
