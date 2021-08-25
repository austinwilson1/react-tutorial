import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className={props.className} onClick={props.onClick}>
      {props.value}
    </button>
  )
}

class Board extends React.Component {
  renderSquare(i) {
    let className = 'square'
    if(this.props.winningSquares && this.props.winningSquares.includes(i)) {
      className += ' highlighted'
    }
    return (
      <Square 
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        className={className}
      />
    )
  }

  createBoard() {
    let board = []
    let i = 0
    while (i<this.props.squares.length) {
      let row = []
      for (let j=0; j<3; j++) {
        row.push(this.renderSquare(i))
        i++
      }
      board.push(<div className="board-row" key={i}>{row}</div>)
    }
    return board
  }

  render() {
    return (
      <div>
        {this.createBoard()}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props)
    this.players = ['X','O']
    this.state = {
      history: [{
        squares:Array(9).fill(null),
        move: {player: null, col: null, row: null}
      }],
      turnNumber: 0,
      winner: null,
      winningSquares: null,
      ascending: true,
    }
  }
  
  handleClick(i) {
    const history = this.state.history.slice(0, this.state.turnNumber + 1)
    const current = history[history.length - 1]
    const squares = current.squares.slice()
    if (this.state.winner || squares[i] || this.state.turnNumber === 9) {
      return;
    }
    squares[i] = this.players[this.state.turnNumber % this.players.length]
    const { winner, winningSquares } = calculateWinner(squares)
    const move = {player: squares[i], col: (i%3 + 1), row: (Math.floor(i/3) + 1)}
    this.setState({
      history: history.concat([{
        squares: squares,
        move: move
      }]),
      turnNumber: history.length,
      winner: winner,
      winningSquares: winningSquares,
    })
  }

  toggleOrder() {
    this.setState({
      ascending: !this.state.ascending
    })
  }

  jumpTo(step) {
    const squares = this.state.history[step].squares
    const { winner, winningSquares } = calculateWinner(squares)
    this.setState({
      turnNumber: step,
      winner: winner,
      winningSquares: winningSquares,
    })
  }

  getMoves(history) {
    let moves = history.map((step, move) => {
      let desc, moveDesc
      if (move) {
        desc = 'Go to move #' + move
        moveDesc = <span className='move-description'>Move: {step.move.player} ({step.move.col},{step.move.row})</span>
      }
      else {
        desc = 'Go to game start'
        moveDesc = '';
      }
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)} className={(this.state.turnNumber === move) ? 'bold' : ''}>{desc}</button>{moveDesc}
        </li>
      )
    })
    if(!this.state.ascending) {
      moves = moves.reverse()
    }
    return moves
  }

  getStatus() {
    let status
    if (this.state.winner) {
      status = 'Winner: ' + this.state.winner + '!'
    }
    else if (this.state.turnNumber === 9) {
      status = 'Draw'
    }
    else {
      status = 'Next player: ' + (this.players[(this.state.turnNumber) % this.players.length])
    }
    return status
  }

  render() {
    const history = this.state.history
    const current = history[this.state.turnNumber]
    const moves = this.getMoves(history)
    const status = this.getStatus()
    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winningSquares={this.state.winningSquares}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
        <div className="game-info">
          <button onClick={() => this.toggleOrder()}>Reverse turn order</button>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  const lines = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
  ]
  for (let i=0; i< lines.length; i++) {
    const [a,b,c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {winner: squares[a], winningSquares: lines[i]}
    }
  }
  return {winner: null, winningSquares: null}
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
