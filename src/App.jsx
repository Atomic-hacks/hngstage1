"use client";
import { useState, useEffect } from "react";
import "./App.css"; 

const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#A133FF", "#33FFF5"];

const App = () => {
  const [targetColor, setTargetColor] = useState("");
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState("Guess the correct color!");

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setTargetColor(randomColor);
    setGameStatus("Guess the correct color!");
  };

  const handleGuess = (color) => {
    if (color === targetColor) {
      setScore((prev) => prev + 1);
      setGameStatus("✅ Correct! 🎉");
    } else {
      setGameStatus("❌ Wrong! Try again.");
    }
  };

  return (
    <div className="game-container">
      <h1>Color Guessing Game</h1>

      {/* Target Color Display */}
      <div id="colorBox" className="color-box" style={{ backgroundColor: targetColor }}></div>

      {/* Instructions */}
      <p data-testid="gameInstructions">Guess the color that matches the box above!</p>

      {/* Color Options */}
      <div className="color-options">
        {colors.map((color, index) => (
          <div
            key={index}
            className="color-option"
            style={{ backgroundColor: color }}
            onClick={() => handleGuess(color)}
            data-testid="colorOption"
          ></div>
        ))}
      </div>

      {/* Game Status */}
      <p data-testid="gameStatus">{gameStatus}</p>

      {/* Score Counter */}
      <p data-testid="score">Score: {score}</p>

      {/* New Game Button */}
      <button className="new-game-button" onClick={startNewGame} data-testid="newGameButton">
        New Game
      </button>
    </div>
  );
};

export default App;
