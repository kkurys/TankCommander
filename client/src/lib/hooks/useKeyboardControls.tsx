import { useCallback, useEffect, useRef } from "react";
import { useKeyboardControls as useDreiKeyboardControls } from "@react-three/drei";

type Subscription = () => void;

export const useKeyboardControls = <T extends string>() => {
  // Get the raw keyboard controls from drei
  const subscriptions = useRef<Record<string, ((value: boolean) => void)[]>>({});
  const [getKeys] = useDreiKeyboardControls<T>();
  
  // Custom subscribe function that allows subscribing to specific controls
  const subscribe = useCallback((
    stateField: (state: Record<T, boolean>) => boolean,
    callback: (value: boolean) => void
  ): Subscription => {
    // Find which control this subscription is for
    const controlKeys = Object.keys(getKeys()) as T[];
    let targetKey: T | null = null;
    
    for (const key of controlKeys) {
      // Create a test state with only this key active
      const testState = controlKeys.reduce((acc, k) => {
        acc[k] = k === key;
        return acc;
      }, {} as Record<T, boolean>);
      
      // If this key returns true from the stateField function, it's our target
      if (stateField(testState)) {
        targetKey = key;
        break;
      }
    }
    
    if (!targetKey) {
      console.error("Could not determine which control to subscribe to");
      return () => {};
    }
    
    // Initialize subscription array for this key if it doesn't exist
    if (!subscriptions.current[targetKey]) {
      subscriptions.current[targetKey] = [];
    }
    
    // Add callback to subscriptions
    subscriptions.current[targetKey].push(callback);
    
    // Initial call with current state
    const currentState = getKeys();
    callback(currentState[targetKey]);
    
    // Return unsubscribe function
    return () => {
      if (subscriptions.current[targetKey]) {
        subscriptions.current[targetKey] = subscriptions.current[targetKey].filter(
          cb => cb !== callback
        );
      }
    };
  }, [getKeys]);
  
  // Set up a listener for key changes
  useEffect(() => {
    let previousState = getKeys();
    
    const checkForChanges = () => {
      const currentState = getKeys();
      
      // Check each control for changes
      Object.keys(currentState).forEach(key => {
        const typedKey = key as T;
        if (currentState[typedKey] !== previousState[typedKey]) {
          // Call all subscriptions for this key
          if (subscriptions.current[key]) {
            subscriptions.current[key].forEach(callback => {
              callback(currentState[typedKey]);
            });
          }
        }
      });
      
      previousState = { ...currentState };
      requestAnimationFrame(checkForChanges);
    };
    
    const frameId = requestAnimationFrame(checkForChanges);
    return () => cancelAnimationFrame(frameId);
  }, [getKeys]);
  
  return [subscribe, getKeys] as const;
};
