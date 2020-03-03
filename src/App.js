import React, { Component } from 'react';
import {BrowserRouter as Router, Route, Switch, Link} from 'react-router-dom';
import './App.css';
// import Pusher from 'pusher-js';
const axios = require('axios');
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
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }


  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
    window.addEventListener('scroll', this.handleScroll);
    this.handleResize()
    this.getCards()
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
    for (let step = 0; step < 8; step++) {
      let reds = this.state.reds
      let find = reds[Math.floor(Math.random() * reds.length)]
      this.setState({ hand: [...this.state.hand, find]});
      const index = reds.indexOf(find);
      if (index > -1) {
        reds.splice(index, 1);
      }
    }
    console.log(this.state.currentGreen)
    console.log(this.state.hand)
  }

  redMap = () => {
    return this.state.hand.map((card, i) => {
      return <div className="redCard"><p>{card}</p></div>
    })
  }

  render() {
    return (
      <Router>
        <nav><Link to="/test">Link</Link></nav>
        <Switch>
          <Route path="/">
            <div className="App" id="app">
              {/* <img id="loadingIcon" src="loading.gif" alt="loading" /> */}
              <div className="greenCard"><p>{this.state.currentGreen}</p></div>
              <div className="redRow">{this.redMap()}</div>
            </div>
        </Route>
        {/* <Route component={Missing}/> */}
      </Switch>
      </Router>
    )
  }
}