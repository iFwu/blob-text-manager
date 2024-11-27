import { useCallback, useEffect, useRef, useState } from 'react';

export type AnimatedState = 'idle' | 'loading' | 'success';

interface UseAnimatedStateProps {
  /**
   * 成功状态的持续时间（毫秒）
   * @default 1500
   */
  successDuration?: number;
  /**
   * 状态变化时的回调
   */
  onStateChange?: (state: AnimatedState) => void;
}

export function useAnimatedState({
  successDuration = 1500,
  onStateChange,
}: UseAnimatedStateProps = {}) {
  const [state, setState] = useState<AnimatedState>('idle');
  const timeoutRef = useRef<NodeJS.Timeout>();

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 状态变化时触发回调
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  const startLoading = useCallback(() => {
    if (state === 'loading') return;
    setState('loading');
  }, [state]);

  const setSuccess = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setState('success');
    timeoutRef.current = setTimeout(() => {
      setState('idle');
    }, successDuration);
  }, [successDuration]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setState('idle');
  }, []);

  return {
    state,
    startLoading,
    setSuccess,
    reset,
    isLoading: state === 'loading',
    isSuccess: state === 'success',
    isIdle: state === 'idle',
  };
}
