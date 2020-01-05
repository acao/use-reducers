import * as React from 'react';
import { render } from 'react-dom';
import { useMath } from './useMath';

import './styles.css';

const customReducer = (state, action, init) => {
  switch (action.type) {
    case useMath.types.increment:
      state.count3 = state.count2 + 3;
      return state;
    case useMath.types.decrement:
      state.count3 = state.count2 - 3;
      return state;
    case useMath.types.reset:
      return init();
    default:
      throw new Error();
  }
};

const customReducer2 = (state, action, init) => {
  switch (action.type) {
    case useMath.types.increment:
      state.count4 = state.count3 + 4;
      return state;
    case useMath.types.decrement:
      state.count4 = state.count3 - 4;
      return state;
    case useMath.types.reset:
      return init();
    default:
      throw new Error();
  }
};

async function customEffect1(args) {
  console.log(`count: ${args.state.count}`);
}

function App() {
  const {
    count,
    count2,
    count3,
    count4,
    increment,
    decrement,
    reset,
  } = useMath<{ count4: number; count3: number }>({
    init: () => ({ count3: 0, count4: 2 }),
    reducers: [customReducer, customReducer2],
    effects: {
      [useMath.types.increment]: [customEffect1],
      [useMath.types.decrement]: [customEffect1],
      foo: [customEffect1],
    },
  });

  return (
    <div className="App">
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <div id="results">
        <div>count: {count} </div>
        <div>count2: {count2} </div>
        <div>count3: {count3} </div>
        <div>count4: {count4} </div>
      </div>
      <button onClick={e => reset()}>Reset</button>
    </div>
  );
}

const rootElement = document.getElementById('root');
render(<App />, rootElement);
