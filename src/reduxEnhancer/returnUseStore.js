/**
 * author: L.S
 * version: 0.0.1-beta
 */
import { useEffect, useState, useMemo } from 'react';

// TODO: 这个名字不太好
export default function returnUseStore(store) {
  /**
   * 订阅store
   */
  function useSubscribe() {
    const [state, setState] = useState(store.getState());
    useEffect(() => {
      return store.subscribe(() => {
        setState(store.getState());
      });
    }, [setState]);

    return state;
  }

  /**
   *
   * selector:
   * ```
   * (state) => ({
   *    a: state.a,
   *    b: state.x.b
   * })
   * ```
   */
  function useStore(selector = v => v) {
    // TODO: 应该有更优写法
    const storeState = useSubscribe();
    const selectedState = useMemo(() => selector(storeState), [
      selector,
      storeState,
    ]);
    const [state, setState] = useState(selectedState);

    // TODO: 目前selector必须返回对象，考虑取消这个限制
    const isDiff = useMemo(
      () =>
        Object.entries(state).some(
          ([key, value]) => selectedState[key] !== value
        ),
      [selectedState, state]
    );

    if (isDiff) {
      setState(selectedState);
    }

    return state;
  }

  return useStore;
}
