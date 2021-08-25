import React from 'react';
import ReactDOM from 'react-dom';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import './index.css';

const styles = {
  gridButtons: {
    fontSize: '7rem',
    fontWeight: 'bold',
  },
  listButtons: {
    textTransform: 'capitalize',
  },
};

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], winningSquares: lines[i] };
    }
  }
  return { winner: null, winningSquares: null };
}

function Square(props) {
  const { className, onClick, disabled, value } = props;
  return (
    <Button variant="outlined" style={styles.gridButtons} className={className} onClick={onClick} disabled={disabled}>
      {value}
    </Button>
  );
}

class Board extends React.Component {
  createBoard() {
    const board = [];
    let i = 0;
    while (i < this.props.squares.length) {
      const row = [];
      for (let j = 0; j < 3; j++) {
        row.push(this.renderSquare(i));
        i++;
      }
      board.push(<div className="board-row" key={i}>{row}</div>);
    }
    return board;
  }

  renderSquare(i) {
    const { squares, onClick, winningSquares } = this.props;
    let className = 'square';
    let disabled = false;
    if (winningSquares) {
      disabled = true;
      if (winningSquares.includes(i)) {
        className += ' highlighted';
      }
    }
    return (
      <Square
        key={i}
        value={squares[i]}
        onClick={() => onClick(i)}
        className={className}
        disabled={disabled}
      />
    );
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
    super(props);
    this.players = ['X', 'O'];
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        move: { player: null, col: null, row: null },
      }],
      turnNumber: 0,
      winner: null,
      winningSquares: null,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.turnNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (this.state.winner || squares[i] || this.state.turnNumber === 9) {
      return;
    }
    squares[i] = this.players[(this.state.turnNumber % this.players.length)];
    const { winner, winningSquares } = calculateWinner(squares);
    const move = { player: squares[i], col: ((i%3)+1), row: (Math.floor(i/3)+1) };
    this.setState({
      history: history.concat([{
        squares,
        move,
      }]),
      turnNumber: history.length,
      winner,
      winningSquares,
    });
  }

  jumpTo(step) {
    const { squares } = this.state.history[step];
    const { winner, winningSquares } = calculateWinner(squares);
    this.setState({
      turnNumber: step,
      winner,
      winningSquares,
    });
  }

  getMoves(history) {
    if (history.length === 1) {
      return null;
    }
    const moves = history.map((step, move) => {
      let desc;
      let moveDesc;
      if (move) {
        desc = `Go to move #${move}`;
        moveDesc = (
          <span className="move-description">
            {step.move.player}
            {' '}
            (
            {step.move.col}
            ,
            {step.move.row}
            )
          </span>
        );
      } else {
        desc = 'Go to game start';
        moveDesc = '';
      }
      return (
        <ListItem 
          key={desc}
          button
          onClick={() => this.jumpTo(move)}
          selected={(this.state.turnNumber === move)}
          style={styles.listItems}
        >
          <ListItemText primary={desc} secondary={moveDesc}/>
        </ListItem>
      );
    });
    return moves;
  }

  getStatus() {
    let status;
    if (this.state.winner) {
      status = `Winner: ${this.state.winner}!`;
    } else if (this.state.turnNumber === 9) {
      status = 'Draw';
    } else {
      status = `Next player: ${this.players[(this.state.turnNumber) % this.players.length]}`;
    }
    return status;
  }

  render() {
    const { history } = this.state;
    const current = history[this.state.turnNumber];
    const moves = this.getMoves(history);
    const status = this.getStatus();
    return (
      <Container maxWidth="md">
        <Typography variant="h3" gutterBottom>Tic-tac-toe</Typography>
        <Box display="flex" flexDirection="row" flexWrap="wrap">
          <Box mr={8}>
            <Board
              squares={current.squares}
              onClick={(i) => this.handleClick(i)}
              winningSquares={this.state.winningSquares}
            />
          </Box>
          <Box>
            <Typography variant="h5">{status}</Typography>
            <List dense component="ol">{moves}</List>
          </Box>
        </Box>
      </Container>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root'),
);
