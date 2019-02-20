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
      display: false,
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
      /*if(this.state.color != "") {
        window.setTimeout(this.turn_off.bind(this), 100)
      }*/
      if(this.state.loser != "") {
        alert(this.state.currentPlayer + " lost!")
      }
  }

  on_click(color) {
    this.channel.push("guess", {color: color})
        .receive("ok", this.got_view.bind(this));
  }

  /*turn_off() {
    this.channel.push("turn_off", {})
        .receive("ok", this.got_view.bind(this));
  }*/

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

    let currentPhrase = <WhosTurn current={this.state.currentPlayer} />

    return (
      <div className="container">
        <div className="row">
          <h3>{currentPhrase}</h3>
        </div>
        <div className="row">



        <table>
          <tbody>
            <tr>
              <td className="red">{redButton}</td>
              <td className="blue">{blueButton}</td>
            </tr>
            <tr>
              <td className="orange">{orangeButton}</td>
              <td className="green">{greenButton}</td>
            </tr>
          </tbody>
        </table>


        </div>

        {showRules}
        {rules}
      </div>
    );
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
  /*if(color == clicked) {
    return   <div></div>
  }
  else {*/
    return   <div onClick={() => on_click(color)}></div>
  //}
}

function WhosTurn(props) {
  let {current} = props
  if(current == window.playerName) {
    return   "It is your turn!"
  }
  else {
    return   "It is not your turn!"
  }
}
