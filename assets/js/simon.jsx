import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

export default function simon_init(root, channel) {
  ReactDOM.render(<Simon channel={channel} />, root);
}

/*Client-Side state for Simon:
{
  color: current color being clicked
  currentPlayer: current player
  loser: player that lost
}*/

class Simon extends React.Component {
  constructor(props) {
    super(props);

    this.channel = props.channel;
    this.state = {
      color: "",
      currentPlayer: "",
      loser: "",
    };

    this.channel.join()
      .receive("ok", this.got_view.bind(this))
      .receive("error", resp => {
        alert("Full game!")
      })

    this.channel.on("update", this.got_view.bind(this))
  }

  got_view(view) {
    console.log("new view", view);
    this.setState(view.game);
    if(this.state.color != "") {
      window.setTimeout(this.turn_off.bind(this), 200)
    }
  }

  on_click(color) {
    this.channel.push("guess", {color: color})
        .receive("ok", this.got_view.bind(this));
  }

  turn_off() {
    this.channel.push("turn_off", {})
        .receive("ok", this.got_view.bind(this));
  }

  render () {
    let redButton = <ColorButton color="red" clicked={this.state.color} on_click={this.on_click.bind(this)} />

    let greenButton = <ColorButton color="green" clicked={this.state.color} on_click={this.on_click.bind(this)} />

    let blueButton = <ColorButton color="blue" clicked={this.state.color} on_click={this.on_click.bind(this)} />

    let orangeButton = <ColorButton color="orange" clicked={this.state.color} on_click={this.on_click.bind(this)} />

    return (
      <div className="container">
        <div className="row">
          <h2>Current Player: {this.state.currentPlayer}</h2>
        </div>
        <div className="row">
          <div className="column">
            <div className="red">{redButton}</div>
          </div>
          <div className="column">
            <div className="green">{greenButton}</div>
          </div>
        </div>
        <div className="row">
          <div className="column">
            <div className="blue">{blueButton}</div>
          </div>
          <div className="column">
            <div className="orange">{orangeButton}</div>
          </div>
        </div>
        <div className="row">
          <h2>{this.state.loser}</h2>
        </div>
      </div>
    );
  }
}

function ColorButton(props) {
  let {color, clicked, on_click} = props
  if(color == clicked) {
    return   <div className="column">
                  <p><button className="flipped"></button></p>
             </div>
  }
  else {
    return   <div className="column">
                <p><button onClick={() => on_click(color)}></button></p>
             </div>
  }
}
