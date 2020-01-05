import {
  useReducers,
  ReducerAction,
  Reducer as GenericReducer,
  UseReducersArgs,
} from './useReducers';

const TYPES = {
  decrement: 'decrement',
  increment: 'increment',
  reset: 'reset',
};

type State = {
  count: number;
  count2: number;
};

// decide whether you want them to add custom action types by appending `& string`
type ActionTypeEnum = keyof typeof TYPES & string;

type Action<A> = ReducerAction<ActionTypeEnum, A & { payload?: any }>;

type Reducer<A = {}> = GenericReducer<State, Action<A>, ActionTypeEnum>;

let baseInit = () => ({ count: 0, count2: 2 });

const reducer1: Reducer = (state, action, init) => {
  switch (action.type) {
    case TYPES.increment:
      state.count = state.count + 1;
      return state;
    case TYPES.decrement:
      state.count = state.count - 1;
      return state;
    case TYPES.reset:
      return init();
    default:
      throw new Error();
  }
};

const reducer2: Reducer = (state, action, init) => {
  switch (action.type) {
    case TYPES.increment:
      state.count2 = state.count2 + 2;
      return state;
    case TYPES.decrement:
      state.count2 = state.count2 - 2;
      return state;
    case TYPES.reset:
      return init();
    default:
      throw new Error();
  }
};

const fetchGoogle = async () => {
  console.log('this happened');
  await fetch(
    'https://swapi-graphql.netlify.com/.netlify/functions/index?query={allPlanets{planets{name}}}',
  )
    .then(r => r.json())
    .then(r => console.log(r))
    .catch(e => {
      console.error(e);
      throw Error(e);
    });
};

export const useMath = <MathState>({
  reducers,
  init,
  effects: userEffects,
}: UseReducersArgs<MathState & State, typeof TYPES>) => {
  const effects = {
    ...userEffects,
    [TYPES.decrement]: [
      fetchGoogle,
      ...((userEffects && userEffects.decrement) || []),
    ],
  };

  const [state, dispatch] = useReducers<MathState & State>({
    reducers: [reducer1, reducer2, ...reducers],
    init: () => ({ ...baseInit(), ...init() }),
    effects,
    actionTypes: TYPES,
  });

  const decrement = payload => dispatch({ type: TYPES.decrement, payload });
  const increment = payload => dispatch({ type: TYPES.increment, payload });
  const reset = payload => dispatch({ type: TYPES.reset, payload });

  return { ...state, decrement, increment, reset };
};

useMath.types = TYPES;
