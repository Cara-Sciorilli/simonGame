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
      losers: [],
      winner: "",
      display: false,
      gameOver: false,
      count: 0,
      userEnds: false,
      addClick: true,
    };

    this.channel.join()
      .receive("ok", this.got_view.bind(this))
      .receive("error", resp => {
        alert("Game already begun!")
      })

    this.channel.on("update", this.got_view.bind(this))

    this.channel.on("gameOver", this.got_gameOver.bind(this))
  }

  got_gameOver(view) {
    this.setState({userEnds: true});
  }

  got_view(view) {
    this.setState(view.game);
      console.log(this.state.losers)
      if(this.state.color != "") {
        window.setTimeout(this.turn_off.bind(this), 400)
      }
      if(this.state.losers != []) {
        if(this.state.losers.includes(window.playerName)) {
          this.setState({gameOver: true});
        }
        else if(this.state.winner == window.playerName) {
          this.setState({gameOver: true});
        }
      }
  }

  on_click(color) {
    this.channel.push("guess", {color: color})
        .receive("ok", this.got_view.bind(this));
  }

  reset() {
    this.channel.push("reset", {})
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

    let currentPhrase = <WhosTurn current={this.state.currentPlayer}
     gameOver={this.state.gameOver}  addClick={this.state.addClick}/>

    let table = <Table red={redButton} green={greenButton} blue={blueButton}
    orange={orangeButton} gameOver={this.state.gameOver}/>

    let endMessage = <EndMessage winner={this.state.winner}
    player={window.playerName} gameOver={this.state.gameOver} userEnds={this.state.userEnds}/>

    let resetButton = <Reset reset={this.reset.bind(this)} gameOver={this.state.gameOver} winner={this.state.winner}/>




    return (
      <div className="container">
        <div className="row">
          <div className="column">
          <h3>{currentPhrase}</h3>
          <h5>Pattern length: {this.state.count}</h5>
          </div>
        </div>
        <div className="row">
          {endMessage}
          {table}

        </div>

        {showRules}
        {rules}

        {resetButton}

      </div>
    );
  }
}


function Reset(props) {
  let {reset, gameOver, winner}= props
  if (gameOver && winner != "") {
    return <button onClick={() => reset()}>end game</button>
  } else {
    return null;
  }
}

function EndMessage(props) {
  let {winner, player, gameOver, userEnds} = props
  if (gameOver && userEnds) {
    return <div>
    <h1>GAME HAS BEEN TERMINATED</h1>
    <p>To join a new game, hit the back button on your browser and enter a
    your player name and a game name (could be the same as this one!)</p>
    </div>
  } else if (!gameOver) {
    return null;
  } else {
   if(winner == player) {
      return <div>
      <h1>🎉 You Won! 🎉</h1>
      <iframe src="https://giphy.com/embed/26gsfdArwyEnXnDGw" width="480"
      height="320" frameBorder="0" className="giphy-embed" allowFullScreen></iframe>
      </div>
    } else {
        return <div>
        <h1>💩 You Lost! 💩</h1>
        <iframe src="https://giphy.com/embed/1BXa2alBjrCXC" width="480"
        height="480" frameBorder="0" className="giphy-embed" allowFullScreen></iframe>
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
  let {current, gameOver, addClick} = props
  if(!gameOver) {
    if(current == window.playerName) {
      if (addClick) {
        return   "It is your turn! Add a new tile"
      } else {
        return   "It is your turn! Replicate pattern"
      }
    }
    else {
      return   "It is your opponents turn!"
    }
  } else {
    return null;
  }
}
