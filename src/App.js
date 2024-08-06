import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(15);
  const [name, setName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [hints, setHints] = useState('');
  const [highScores, setHighScores] = useState([]);
  const [userGuess, setUserGuess] = useState('');

  useEffect(() => {
    async function fetchCountries() {
      try {
        const response = await axios.get('https://countriesnow.space/api/v0.1/countries/flag/images');
        setCountries(response.data.data);
        selectRandomCountry(response.data.data);
      } catch (error) {
        console.error('Error fetching countries', error);
      }
    }
    fetchCountries();
    const storedScores = JSON.parse(localStorage.getItem('highScores'));
    if (storedScores) {
      setHighScores(storedScores);
    }
  }, []);

  useEffect(() => {
    if (gameStarted && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setScore((prev) => prev - 1);
      selectRandomCountry(countries);
      setTimer(15);
      setHints('');
      setUserGuess('');
    }
  }, [timer, gameStarted]);

  const selectRandomCountry = (countriesList) => {
    const randomIndex = Math.floor(Math.random() * countriesList.length);
    setSelectedCountry(countriesList[randomIndex]);
  };

  const handleGuess = () => {
    if (userGuess.toLowerCase() === selectedCountry.name.toLowerCase()) {
      setScore((prev) => prev + 10 + timer);
      setTimer(15);
      selectRandomCountry(countries);
      setHints('');
      setUserGuess('');
    } else {
      setScore((prev) => prev - 1);
    }
  };

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleHint = () => {
    if (selectedCountry) {
      const countryName = selectedCountry.name;
      const revealedLetters = hints.length + 1;
      setHints(countryName.substring(0, revealedLetters));
      setTimer((prev) => prev - 2);
    }
  };

  const saveHighScore = () => {
    const newScore = { name, score };
    const updatedScores = [...highScores, newScore].sort((a, b) => b.score - a.score).slice(0, 10);
    setHighScores(updatedScores);
    localStorage.setItem('highScores', JSON.stringify(updatedScores));
  };

  useEffect(() => {
    if (!gameStarted && score > 0) {
      saveHighScore();
    }
  }, [gameStarted]);

  return (
    <div className="App">
      <h1>Flag Quiz Game</h1>
      {!gameStarted ? (
        <div>
          <input 
            type="text" 
            placeholder="Ingresa tu nombre" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
          <button onClick={handleStartGame}>Empezar Juego</button>
          <h2>High Scores</h2>
          <ul>
            {highScores.map((score, index) => (
              <li key={index}>{score.name}: {score.score}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <h2>Adivina el pais</h2>
          <img src={selectedCountry ? selectedCountry.flag : ''} alt="Bandera" />
          <input 
            type="text" 
            placeholder="Adivina el pais" 
            value={userGuess}
            onChange={(e) => setUserGuess(e.target.value)}
          />
          <button onClick={handleGuess}>enviar</button>
          <button onClick={handleHint}>pista</button>
          <p>pista: {hints}</p>
          <p>Score: {score}</p>
          <p>Tiempo: {timer}s</p>
        </div>
      )}
    </div>
  );
}

export default App;
