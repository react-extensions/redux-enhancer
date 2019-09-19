/**
 * author: L.S
 * version: 0.0.1-beta
 */
import isPlainObject from './isPlainObject';

/**
 * 创建一个具有作用域的reducer
 */
function useScopedReducer(scope, reducer) {
  if (!scope) {
    throw Error('The parameter scope is required.');
  }

  // TODO: symbol?
  if (typeof scope !== 'string') {
    throw TypeError('Expected the scope to be a string.');
  }

  if (!reducer) {
    throw Error('The parameter reducer is required.');
  }

  // TODO: 需不需要在@@namaspace后加一串随机数？
  // 将 action.type 用作用域字符串包裹起来
  const scopePrefix = `@@scope/${scope}/`;
  const useScope = actionType => `${scopePrefix}${actionType}`;

  //
  // 为普通的reducer注入useScope函数作为第三个参数
  //
  // =========================================>
  //
  // function reducer(state, action, scope) {
  //    if(action.type === scope('ADD_ITEM')) {
  //        return {...state, value: action.value}
  //    }
  //    return state;
  // }
  //
  // =========================================> 进化
  // 我在这里直接做scope拦截，在reducer里面不用这种繁琐的写法 scope('ADD_ITEM')了
  //
  // TODO: 判断是普通函数，即没有进行过 bind 操作
  const scopedReducer = (state, action) => {
    const { type } = action;
    const match = type.match(new RegExp(`^${scopePrefix}(.*)`));
    if (match !== null) {
      return reducer.call(null, state, { ...action, type: match[1] });
    }
    return reducer.call(null, state, action);
  };

  // 通常，一个reducer对应着一个或多个dispatch，反过来一个dispatch也可能对应一个或多个reducer，
  // 大多数的时候，我们只需要dispatch({type: '', value: ''})发送的数据只会被特定的唯一的reducer
  // 捕获，然后更新state。
  // 在这里我们进行约束，当创建scopedReducer时，会返回一个useScopedDispatch函数，通过这个函数
  // 注册的dispatch只对当前的scopedReducer起作用，从而不用担心action.type冲突。
  // TODO:如果我们确实有一个dispatch被多个reducer捕获的需要，直接用原生dispath？
  // TODO: 这个名字不太好
  const useScopedDispatch = function useScopedDispatch(
    rawDispatch,
    dispatchsGenerator
  ) {
    /**
     * 增强版的dispatch
     * @param {*} action
     */
    const scopedDispatch = function scopedDispatch(action) {
      if (isPlainObject(action)) {
        rawDispatch({
          ...action,
          // eslint-disable-next-line react-hooks/rules-of-hooks
          type: useScope(action.type),
        });
        return;
      }
      rawDispatch(action);
    };

    return dispatchsGenerator(scopedDispatch);
  };

  return [scopedReducer, useScopedDispatch];
}

export default useScopedReducer;
