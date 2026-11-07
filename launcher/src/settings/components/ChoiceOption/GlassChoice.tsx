import "../../../vendor/glisse/styles.css";

import type { ComponentChildren } from "preact";
import { flushSync } from "preact/compat";
import { useCallback, useContext, useLayoutEffect, useRef } from "preact/hooks";

import { focusControl } from "../../../shared/navigation/focusControl";
import { Button } from "../../../vendor/glisse/button";
import { FocusedControlContext } from "../../context";
import { useSettingsEnvironment } from "../../hooks/useSettingsEnvironment";

import styles from "./GlassChoice.module.css";

interface Props {
  children: ComponentChildren;
  id: string;
  onSelect(): void;
  selected: boolean;
}

// Glisse's button, with its Liquid Glass press, as a Settings choice in UOS: the chosen one is
// filled with the accent, as Glisse's primary button is. Like any Settings control it is
// focused by the remote and picked with OK.
export const GlassChoice = ({ id, selected, onSelect, children }: Props) => {
  const { navigation } = useSettingsEnvironment();
  const focused = useContext(FocusedControlContext) === id;
  const ref = useRef<HTMLButtonElement | null>(null);
  const register = useCallback(
    (node: HTMLButtonElement | null) => {
      ref.current = node;
      navigation.register(id, node);
    },
    [navigation, id],
  );
  useLayoutEffect(() => {
    if (focused) {
      focusControl(ref.current);
    }
  }, [focused]);
  return (
    <Button
      ref={register}
      className={styles.choice}
      variant={selected ? "filled" : "glass"}
      data-key={id}
      data-focused={focused ? "true" : undefined}
      aria-pressed={selected}
      tabIndex={focused ? 0 : -1}
      onFocus={() => flushSync(() => navigation.select(id))}
      onClick={() => {
        flushSync(() => navigation.select(id));
        onSelect();
      }}
    >
      {children}
    </Button>
  );
};
