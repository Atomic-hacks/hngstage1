import { useState, useEffect } from 'react';
import "./App.css"; 

/**
 * Game configuration object defining different game modes and their parameters
 */
const GAME_MODES = {
  CLASSIC: {
    name: 'Classic',
    description: 'Match the target color to win points',
    timeLimit: 10,
    colors: 6
  },
  SPEED: {
    name: 'Speed Run',
    description: 'Match as many colors as you can in 30 seconds',
    timeLimit: 30,
    colors: 6
  },
  MEMORY: {
    name: 'Memory',
    description: 'Remember and match the color after it disappears',
    timeLimit: 15,
    colors: 6
  }
};

/**
 * Generates an array of random HSL colors
 * @param {number} count - Number of colors to generate
 * @returns {string[]} Array of HSL color strings
 */
const generateRandomColors = (count) => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 30) + 70; 
    const l = Math.floor(Math.random() * 30) + 35; 
    colors.push(`hsl(${h}, ${s}%, ${l}%)`);
  }
  return colors;
};

/**
 * Main Color Master Pro game component
 */
const App = () => {
  // Game state management
  const [gameMode, setGameMode] = useState(null);
  const [targetColor, setTargetColor] = useState('');
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState({
    CLASSIC: 0,
    SPEED: 0,
    MEMORY: 0
  });
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameStatus, setGameStatus] = useState('Choose a game mode!');
  const [showTarget, setShowTarget] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [showAchievement, setShowAchievement] = useState(false);
  const [lastAchievement, setLastAchievement] = useState(null);

  /**
   * Initializes game state when game mode is selected
   */
  useEffect(() => {
    if (gameMode) {
      const initialColors = generateRandomColors(GAME_MODES[gameMode].colors);
      const initialTarget = initialColors[Math.floor(Math.random() * initialColors.length)];
      setTargetColor(initialTarget);
      setOptions(initialColors);
      setShowTarget(true);
    }
  }, [gameMode]);

  /**
   * Manages game timer and handles game over condition
   */
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isPlaying) {
      endGame();
    }
  }, [timeLeft, isPlaying]);

  /**
   * Handles click outside game over modal to close it
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      const modal = document.querySelector('.game-over');
      if (modal && !modal.contains(event.target)) {
        setGameOver(false);
      }
    };

    if (gameOver) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [gameOver]);

  /**
   * Initializes a new game session
   * @param {string} mode - Selected game mode
   */
  const startGame = (mode) => {
    setGameMode(mode);
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setStreak(0);
    setTimeLeft(GAME_MODES[mode].timeLimit);
    setGameStatus('Match the colors!');
    generateNewRound();
  };

  /**
   * Generates a new round with fresh colors
   */
  const generateNewRound = () => {
    const newColors = generateRandomColors(GAME_MODES[gameMode].colors);
    const target = newColors[Math.floor(Math.random() * newColors.length)];
    setTargetColor(target);
    setOptions(newColors);
    setShowTarget(true);
    
    if (gameMode === 'MEMORY') {
      setTimeout(() => setShowTarget(false), 800); 
    }
  };

  /**
   * Processes player's color selection and updates game state
   * @param {string} color - Selected color value
   */
  const handleGuess = (color) => {
    if (!isPlaying || gameOver) return;

    if (color === targetColor) {
      const timeBonus = Math.ceil(timeLeft / 2);
      const points = gameMode === 'SPEED' ? 100 : (100 + timeBonus);
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setBestStreak(prev => Math.max(prev, streak + 1));
      checkAchievements(streak + 1, score + points);
      generateNewRound();
      
      if (gameMode === 'CLASSIC') {
        setTimeLeft(GAME_MODES.CLASSIC.timeLimit);
      }
    } else {
      setStreak(0);
      
      switch(gameMode) {
        case 'CLASSIC':
          endGame();
          break;
        case 'SPEED':
          setScore(prev => Math.max(0, prev - 50));
          setTimeLeft(prev => Math.max(0, prev - 5));
          generateNewRound();
          break;
        case 'MEMORY':
          endGame();
          break;
      }
    }
  };

  /**
   * Checks and awards achievements based on player performance
   * @param {number} currentStreak - Current streak count
   * @param {number} currentScore - Current score
   */
  const checkAchievements = (currentStreak, currentScore) => {
    const newAchievements = [];
    
    if (currentStreak === 5 && !achievements.includes('STREAK_5')) {
      newAchievements.push({ id: 'STREAK_5', title: '🔥 Hot Streak', message: '5 correct guesses in a row!' });
    }
    if (currentScore >= 1000 && !achievements.includes('SCORE_1000')) {
      newAchievements.push({ id: 'SCORE_1000', title: '🏆 Point Master', message: 'Score over 1000 points!' });
    }
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements.map(a => a.id)]);
      setLastAchievement(newAchievements[0]);
      setShowAchievement(true);
      setTimeout(() => setShowAchievement(false), 3000);
    }
  };

  /**
   * Handles game over state and updates high scores
   */
  const endGame = () => {
    setIsPlaying(false);
    setGameOver(true);
    setHighScores(prev => ({
      ...prev,
      [gameMode]: Math.max(prev[gameMode], score)
    }));
  };

  /**
   * Renders the main game interface
   */
  const renderGameUI = () => (
    <div className="game-content">
      <div className="game-header">
        <h2>{GAME_MODES[gameMode].name}</h2>
        <p className="instructions">
          {GAME_MODES[gameMode].description}
        </p>
      </div>

      <div
        data-testid="colorBox"
        className={`color-box ${!showTarget ? 'hidden' : ''} ${gameMode === 'MEMORY' ? 'memory-mode' : ''}`}
        style={{ backgroundColor: showTarget ? targetColor : '#333' }}
      />

      <div className="game-info">
        <div className="stats">
          <div className="stat">⏱️ {timeLeft}s</div>
          <div className="stat">🎯 Score: {score}</div>
          <div className="stat">🔥 Streak: {streak}</div>
        </div>
        <p data-testid="gameStatus" className="status">
          {gameStatus}
        </p>
      </div>

      <div className="color-grid">
        {options.map((color, index) => (
          <button
            key={index}
            data-testid="colorOption"
            className="color-option"
            style={{ backgroundColor: color }}
            onClick={() => handleGuess(color)}
          />
        ))}
      </div>
      <div className='game-select'>
        <button 
        data-testid="newGameButton"
        className="new-game-btn"
        onClick={() => setGameMode(null)}
      >
        Change Mode
      </button>
      <button onClick={() => startGame(gameMode)}>Play Again</button>
      </div> 
    </div>
  );

  /**
   * Renders the game mode selection interface
   */
  const renderModeSelection = () => (
    <div className="mode-selection">
      <h2>Select Game Mode</h2>
      <div className="mode-grid">
        {Object.entries(GAME_MODES).map(([mode, details]) => (
          <div key={mode} className="mode-card" onClick={() => startGame(mode)}>
            <h3>{details.name}</h3>
            <p>{details.description}</p>
            <div className="high-score">High Score: {highScores[mode]}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="app">
      <h1>Color Master</h1>
      
      {gameMode ? renderGameUI() : renderModeSelection()}

      {showAchievement && (
        <div className="achievement-popup">
          <h3>{lastAchievement.title}</h3>
          <p>{lastAchievement.message}</p>
        </div>
      )}

      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over">
            <h2>Game Over!</h2>
            <p>Final Score: {score}</p>
            <p>Best Streak: {bestStreak}</p>
            <button onClick={() => startGame(gameMode)}>Play Again</button>
            <button onClick={() => setGameOver(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;