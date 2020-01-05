import { useReducer } from 'react';

export type Reducer<S, A, AT> = (
  state: S,
  action: ReducerAction<AT, A>,
  initFunction: () => Partial<S>,
) => S;

export type ReducerAction<ActionTypes, Action = { [key: string]: any }> = {
  type: ActionTypes;
} & Action;

export type Effect<S> = ({ state, ...args }: { state: S }) => Promise<void>;
export type Effects<S, AT> = {
  [actionType: AT]: Effect<S>[];
};

export type UseReducersArgs<S, AT> = {
  reducers: Reducer<S, {}, AT>[];
  init: () => Partial<S>;
  effects: Effects<S, AT>;
};

export type DispatchWithEffects<AT> = (action: ReducerAction<AT>) => void;

export type ActionTypeEnum<AT> = keyof AT;

export function useReducers<State>({
  reducers = [],
  init = () => Object.create(null),
  effects,
  actionTypes,
}: UseReducersArgs<State, ActionTypeEnum<typeof actionTypes>> & { actionTypes: { [key: string]: string } }): [
  State,
  DispatchWithEffects<typeof actionTypes>
] {
  const [state, dispatch] = useReducer(
    function combineReducers(state, action) {
      return reducers.reduce(function reduceReducer(s, r) {
        return r({ ...s, ...r }, { ...action, ...r }, init);
      }, state);
    },
    init(),
    init,
  );

  const dispatchWithEffects: DispatchWithEffects<
    keyof typeof actionTypes
  > = async ({ type, ...args }) => {
    const effectsForType = effects && effects[type];
    await dispatch({ type, ...args });
    if (effectsForType && Array.isArray(effectsForType)) {
      const runEffects = effectsForType.map(async e =>
        e({state, action: args, dispatch}),
      );
      await Promise.all(runEffects).catch(e => console.error(e));
    }
  };

  return [state, dispatchWithEffects];
}
