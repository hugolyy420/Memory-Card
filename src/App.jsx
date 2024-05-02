import { useState, useEffect, useRef } from 'react';
import { Tooltip } from 'react-tooltip';
import { v4 as uuidv4 } from 'uuid';

import './App.css';

function App() {
  const [spinner, setSpinner] = useState(false);
  const [cards, setCards] = useState([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [restart, setRestart] = useState(false);
  const modalRef = useRef(null);

  const getPokemanData = async () => {
    const offset = Math.floor(Math.random() * 1000);
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/?limit=12&offset=${offset}`, {
      mode: 'cors'
    });
    const pokemanSet = await response.json();
    const pokemanSetArray = pokemanSet.results;
    const pokemanResponse = await Promise.all(
      pokemanSetArray.map((pokeman) =>
        fetch(pokeman.url, {
          mode: 'cors'
        })
      )
    );
    const pokemanResults = await Promise.all(pokemanResponse.map((res) => res.json()));
    const pokemanCardsData = pokemanResults.map(({ name, sprites }) => ({
      id: uuidv4(),
      name,
      url: sprites.front_default,
      clicked: false
    }));
    return pokemanCardsData;
  };

  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const isClick = (id) => {
    const target = cards.find((card) => card.id === id);
    return target.clicked;
  };

  const openModal = () => {
    if (modalRef.current) modalRef.current.showModal();
  };

  const restartGame = () => {
    if (modalRef.current) modalRef.current.close();
    if (score > bestScore) setBestScore(score);
    setScore(0);
    setRestart(!restart);
    if (gameOver) setGameOver(!gameOver);
  };

  const checkClicked = (id) => {
    if (isClick(id)) {
      setGameOver(!gameOver);
      openModal();
      return;
    }
    setScore((prev) => (prev += 1));
    const temp = [...cards];
    const newTemp = temp.map((card) => {
      if (card.id === id) return { ...card, clicked: true };
      return card;
    });
    if (isWin(newTemp)) {
      openModal();
      return;
    }
    const shuffledCards = shuffle(newTemp);
    setCards(shuffledCards);
  };

  const isWin = (array) => {
    return array.every((card) => card.clicked);
  };

  useEffect(() => {
    setSpinner(true);
    let mounted = true;
    const loadPokeman = async () => {
      const data = await getPokemanData();
      if (mounted) {
        setCards(data);
        setSpinner(false);
      }
    };
    loadPokeman();
    return () => {
      mounted = false;
    };
  }, [restart]);

  return (
    <>
      <header>
        <h1>Memory Card</h1>
        <div className="score-board">
          <div className="score">
            <h2>Score: {score}</h2>
          </div>
          <div className="best-score">
            <h2>Best: {bestScore > 0 ? bestScore : score}</h2>
          </div>
        </div>
      </header>
      <main>
        {spinner ? (
          <section className="cards-container loading">
            <div className="lds-ripple">
              <div></div>
              <div></div>
            </div>
            <p>Loading...</p>
          </section>
        ) : (
          <>
            <section className="cards-container">
              {cards.map((card) => (
                <div key={card.id} className="card-container">
                  <button
                    type="button"
                    className="card-button"
                    onClick={() => {
                      checkClicked(card.id);
                    }}>
                    <img src={card.url} alt="" className="pokeman-image" />
                    <p className="pokeman-name">{card.name}</p>
                  </button>
                </div>
              ))}
            </section>
          </>
        )}
        <dialog id="message-modal" ref={modalRef}>
          <div className="message-container">
            {gameOver ? <p>You lose</p> : <p>You win</p>}
            <button type="button" className="restart-button" onClick={restartGame}>
              <p>Restart</p>
            </button>
          </div>
        </dialog>
        <div
          className="instruction-box"
          data-tooltip-id="instruction-tooltip"
          data-tooltip-content={'Win the game by clicking each card only ONCE!'}
          data-tooltip-place="top-start">
          ?
        </div>
        <Tooltip id="instruction-tooltip" />
      </main>
    </>
  );
}

export default App;
