import React, { useState, useEffect, MouseEvent } from 'react';

import './wordleStyle.css';
import data from './answers.json';



const ANSWER_LENGTH = 5;
const MAX_GUESS_CHANCE = 6;

function App() {

  const [answer, setAnswer] = useState('');
  const [guesses, setGuesses] = useState<string[]>(Array(MAX_GUESS_CHANCE).fill(''));
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    generateRandomAnswer();
  }, []);

  useEffect(() => {

    const handleType = (event: globalThis.KeyboardEvent) => {

      if (gameOver) {
        return;
      }

      if (event.key === 'Enter' && currentGuess.length === ANSWER_LENGTH) {

        if (currentGuess === answer) {
          setGameOver(true);
        }

        setGuesses((prevGuesses) => prevGuesses.map((singleGuess, singleGuessIndex) => {
          const currentIndex = getCurrentGuessIndex();

          if (currentIndex === MAX_GUESS_CHANCE - 1) {
            setGameOver(true);
          }

          if (singleGuessIndex === currentIndex) {
            return currentGuess;
          }
          else {
            return singleGuess;
          }

        }));
        setCurrentGuess('');
      }
      else if (event.key === 'Backspace' && currentGuess.length) {
        setCurrentGuess(prevCurrentGuess => prevCurrentGuess.slice(0, -1));
      }
      else if (event.key.toUpperCase().match(/^[A-Z]{1}$/)?.length && currentGuess.length < ANSWER_LENGTH) {

        setCurrentGuess(prevCurrentGuess => prevCurrentGuess + event.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleType);

    return () => {
      window.removeEventListener('keydown', handleType);
    };
  }, [currentGuess, gameOver]);

  const handleRetryButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    generateRandomAnswer();
    setGuesses(Array(MAX_GUESS_CHANCE).fill(''));
    setCurrentGuess('');
    setGameOver(false);

    e.currentTarget.blur()
  };

  const getCurrentGuessIndex = () => {
    return guesses.findIndex((singleGuess) => singleGuess === '')
  };

  const generateRandomAnswer = () => {

    const { answers } = data;

    const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
    setAnswer(randomAnswer);
  };

  const wonGame = gameOver && guesses.includes(answer);

  return (
    <>
      <header className='header'>
        Wordle Clone
      </header>

      <div className='board'>
        {guesses.map((singleGuess, guessIndex) => {

          const currentGuessIndex = getCurrentGuessIndex();

          const isCurrentGuess = guessIndex === currentGuessIndex;

          const lastGuessTyped = guesses.every((singleGuess) => singleGuess.length === ANSWER_LENGTH);

          return (
            <Line
              key={guessIndex}
              guess={isCurrentGuess ? currentGuess : singleGuess}
              answer={answer}
              enterPressed={lastGuessTyped ? true : guessIndex <= currentGuessIndex - 1}
            />
          );
        })}
      </div>

      <div className={`game-status ${wonGame ? 'won' : 'lost'}`}>
        {gameOver && (guesses.includes(answer) ? `You've got it!` : 'No luck today :(')}
      </div>

      <footer className='footer'>
        <button className='try-again-button' onClick={handleRetryButtonClick}>Try Again</button>
      </footer>
    </>
  );
}

interface ILineProps {
  guess: string;
  answer: string;
  enterPressed: boolean;
}

function Line({ guess, answer, enterPressed }: ILineProps) {

  const tiles = [];

  for (let i = 0; i < ANSWER_LENGTH; i++) {

    const char = guess[i];

    let className = 'tile';
    if (enterPressed) {
      if (char === answer[i]) {
        className += ' correct';
      }
      else if (answer.includes(char)) {
        className += ' close';
      }
      else {
        className += ' wrong';
      }
    }

    tiles.push(
      <div className={className} key={i}>
        {char}
      </div>
    );
  }

  return (
    <div className='line' >
      {tiles}
    </div>
  );
}

export default App;
