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
  loser: player that lost most recently
  winner: winner
  display: to display rules or not
}*/

class Simon extends React.Component {
  constructor(props) {
    super(props);

    this.channel = props.channel;
    this.state = {
      color: "",
      currentPlayer: "",
      loser: "",
      winner: "",
      display: false,
      gameOver: false,
    };

    this.channel.join()
      .receive("ok", this.got_view.bind(this))
      .receive("error", resp => {
        alert("Game already begun!")
      })

    this.channel.on("update", this.got_view.bind(this))
  }

  got_view(view) {
    console.log("new view", view);
    this.setState(view.game);
      if(this.state.color != "") {
        window.setTimeout(this.turn_off.bind(this), 400)
      }
      if(this.state.loser != "") {
        this.setState({gameOver: true});
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

  showRules() {
    let newState = !this.state.display;
    this.setState({display: newState});
  }

  render () {
    let redButton = <ColorButton color="red" clicked={this.state.color} on_click={this.on_click.bind(this)} />

    let greenButton = <ColorButton color="green" clicked={this.state.color} on_click={this.on_click.bind(this)} />

    let blueButton = <ColorButton color="blue" clicked={this.state.color} on_click={this.on_click.bind(this)} />

    let orangeButton = <ColorButton color="orange" clicked={this.state.color} on_click={this.on_click.bind(this)} />

    let rules = <RulesParagraph show={this.state.display}/>

    let showRules = <RulesToggle show={this.state.display} showRules={this.showRules.bind(this)} />

    let currentPhrase = <WhosTurn current={this.state.currentPlayer} gameOver={this.state.gameOver} />

    let table = <Table red={redButton} green={greenButton} blue={blueButton} orange={orangeButton} gameOver={this.state.gameOver}/>

    let endMessage = <EndMessage winner={this.state.winner} loser={this.state.loser} player={window.playerName} gameOver={this.state.gameOver}/>


    return (
      <div className="container">
        <div className="row">
          <h3>{currentPhrase}</h3>
        </div>
        <div className="row">
          {endMessage}
          {table}
        </div>

        {showRules}
        {rules}
      </div>
    );
  }
}

function EndMessage(props) {
  let {winner, loser, player, gameOver} = props
  if (!gameOver) {
    return null;
  } else {
    if(loser == player) {
      return <div>
      <h1>💩 You Lost! 💩</h1>
      <iframe src="https://giphy.com/embed/1BXa2alBjrCXC" width="480"
      height="480" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>
      </div>
    }
    else if(winner == player) {
      return <div>
      <h1>🎉 You Won! 🎉</h1>
      <iframe src="https://giphy.com/embed/26gsfdArwyEnXnDGw" width="480"
      height="320" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>
      </div>
    }
  }
}


function Table(props) {
  let {red, green, blue, orange, gameOver} = props
  if(!gameOver) {
  return <table>
    <tbody>
      <tr>
        <td className="red">{red}</td>
        <td className="blue">{blue}</td>
      </tr>
      <tr>
        <td className="orange">{orange}</td>
        <td className="green">{green}</td>
      </tr>
    </tbody>
  </table>
} else {
  return null;
}
}

function RulesToggle(props){
  let {show, showRules} = props
  if (show) {
    return <div>
            <label htmlFor="rulesbox" className="btn" onClick={() => showRules()}>Close</label>
            <input type="checkbox" id="rulesbox" className="hidden " />
          </div>
  } else {
    return <div>
          <label htmlFor="rulesbox" className="btn" onClick={() => showRules()}>Read rules</label>
          <input type="checkbox" id="rulesbox" className="hidden " />
        </div>
}
}

function RulesParagraph(props) {
  let {show} = props
  if (show == true) {
    return <p>This is the game of Simon. Remember Simon Says, the game from your childhood?
    It's just like that - only digital. You and your partner will take turns adding 1
    click to the pattern at a time. When it's your turn, a pattern will be displayed to you.
    Your task is to replicate the pattern correctly! If you do so, you then get to add 1
    more click. The game gets harder as you go... good luck!</p>
  } else {
    return null
  }
}


function ColorButton(props) {
  let {color, clicked, on_click} = props
  if(color == clicked) {
    //This needs to render a lit up button with no on click
    switch(color) {
    case 'red':
      return   <div className="redActive"></div>;
    case 'green':
      return   <div className="greenActive"></div>;
    case 'blue':
      return   <div className="blueActive"></div>;
    case 'orange':
      return   <div className="orangeActive"></div>;
    default:
      return   <div className="clicked"></div>;
  }

  }
  else {
    //This needs to render a not lit up button with an on click
    return   <div onClick={() => on_click(color)}></div>
  }
}

function WhosTurn(props) {
  let {current, gameOver} = props
  if(!gameOver) {
  if(current == window.playerName) {
    return   "It is your turn!"
  }
  else {
    return   "It is your opponents turn!"
  }
} else {
  return null;
}
}
