import React, {Component} from 'react';
export default class Card extends Component{
    render(){
        return (
             <div className="whiteCard animation" id={this.props.card} onClick={this.props.selectHandler}><p>{this.props.card}</p></div>
        )
    }
}