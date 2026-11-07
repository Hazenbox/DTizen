// Glisse is written against React. The launcher renders it through preact/compat (see
// vite.config.mts), and this gives its sources the React types they expect so they
// typecheck unmodified. Attribute props are plain strings and objects, as in React.
import type * as preact from "preact";

export { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "preact/hooks";
export { forwardRef } from "preact/compat";

export type CSSProperties = preact.JSX.CSSProperties;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ElementType = "a" | preact.ComponentType<any>;
export type ReactNode = preact.ComponentChildren;
export type RefObject<T> = preact.RefObject<T>;
export type RefAttributes<T> = { ref?: preact.Ref<T> };
export type ForwardRefExoticComponent<P> = preact.FunctionComponent<P>;
export type HTMLAttributes<T extends EventTarget = HTMLElement> = Omit<
  preact.JSX.HTMLAttributes<T>,
  "class" | "className" | "style"
> & {
  className?: string;
  style?: CSSProperties;
};
export type InputHTMLAttributes<T extends EventTarget = HTMLInputElement> = HTMLAttributes<T> & {
  disabled?: boolean;
  maxLength?: number;
  placeholder?: string;
  type?: string;
};
export type ButtonHTMLAttributes<T extends EventTarget = HTMLButtonElement> = HTMLAttributes<T> & {
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};
export declare namespace JSX {
  type Element = preact.JSX.Element;
}

declare global {
  // Chromium 69 has flatMap; the launcher's ES2018 type library predates it.
  interface Array<T> {
    flatMap<U>(callback: (value: T, index: number, array: T[]) => U | readonly U[]): U[];
  }
}
