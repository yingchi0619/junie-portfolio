'use client';
import { useSyncExternalStore } from 'react';
import { useReducedMotion } from 'motion/react';
const subscribe = () => () => {};
const client = () => true;
const server = () => false;
/** Keep server markup and the first hydration render identical. */
export function useSafeReducedMotion() {
  const reduced = useReducedMotion();
  const hydrated = useSyncExternalStore(subscribe, client, server);
  return hydrated && !!reduced;
}
