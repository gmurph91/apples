import React, {Component} from 'react';
export default class Card extends Component{
    render(){
        return (
             <div className="redCard animation" id={this.props.card} onClick={this.props.selectHandler}><p>{this.props.card}</p></div>
        )
    }
}