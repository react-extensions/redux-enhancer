/* eslint-disable no-param-reassign */
/* eslint-disable react-hooks/rules-of-hooks */
import { createStore, combineReducers } from 'redux';
import loadStore from './returnUseStore';
import useScopedReducer from './useScopedReducer';

function createEnhancedStore(preloadedState, storeEnhancer) {
  // -
  // 不用做参数判断，因为createStore内部会做，这里只是传递而已
  const initialReducer = (state = {}) => state;

  const store = createStore(initialReducer, preloadedState, storeEnhancer);

  // TODO: 支持在老项目上直接使用此框架而不用改动原代码
  const internalReducerMap = {};

  const { dispatch, replaceReducer, subscribe, getState } = store;

  const addReducer = function addReducer(scope, reducer) {
    // -
    if (internalReducerMap[scope]) {
      throw Error(`Scope ${scope} conflict, this Scope already exists.`);
    }

    const [scopedReducer, useScopedDispatch] = useScopedReducer(scope, reducer);

    internalReducerMap[scope] = scopedReducer;

    // TODO: 这种方式太过局限，能不能自定义？
    replaceReducer(combineReducers(internalReducerMap));

    return useScopedDispatch.bind(null, dispatch);
  };

  return {
    useStore: loadStore(store),
    addReducer,
    subscribe,
    getState,
    dispatch,
  };
}

export default createEnhancedStore;
