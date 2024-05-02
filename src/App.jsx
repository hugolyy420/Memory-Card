import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import './App.css';

function App() {
  const [spinner, setSpinner] = useState(false);
  const [cards, setCards] = useState([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState('');
  const [gameOver, setGameOver] = useState(false);

  const getPokemonData = async () => {
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

  const checkClicked = (id) => {
    if (isClick(id)) {
      setGameOver(!gameOver);
      return;
    }
    const temp = [...cards];
    const newTemp = temp.map((card) => {
      if (card.id === id) return { ...card, clicked: true };
      return card;
    });
    const shuffledCards = shuffle(newTemp);
    setCards(shuffledCards);
    setScore((prev) => (prev += 1));
  };

  useEffect(() => {
    setSpinner(true);
    let mounted = true;
    const fetchPokeman = async () => {
      const data = await getPokemonData();
      if (mounted) {
        setCards(data);
        setSpinner(false);
      }
    };
    fetchPokeman();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <header>
        <h1>Memory Card</h1>
      </header>
      <main>
        {spinner ? (
          <section className="cards-container loading">
            <p>loading...</p>
          </section>
        ) : (
          <>
            <section className="score-board">
              <div className="score">
                <p>Score: {score}</p>
              </div>
              <div className="best-score">
                <p>Best: {bestScore ? bestScore : score}</p>
              </div>
            </section>
            <section className="cards-container">
              {cards.map((card) => (
                <div key={card.id} className="card-container">
                  <button
                    type="button"
                    className="card-button"
                    onClick={() => checkClicked(card.id)}>
                    <img src={card.url} alt="" className="pokeman-image" />
                    <p className="pokemon-name">{card.name}</p>
                  </button>
                </div>
              ))}
            </section>
          </>
        )}
      </main>
    </>
  );
}

export default App;
