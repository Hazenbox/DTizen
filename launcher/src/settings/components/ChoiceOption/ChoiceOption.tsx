import type { ComponentChildren } from "preact";

import { useStore } from "../../../shared/hooks/useStore";
import text from "../../../shared/styles/text.module.css";
import { useSettingsEnvironment } from "../../hooks/useSettingsEnvironment";
import { SettingsControl } from "../SettingsControl/SettingsControl";

import styles from "./ChoiceOption.module.css";
import { GlassChoice } from "./GlassChoice";

interface Props {
  children: ComponentChildren;
  id: string;
  inline?: boolean;
  onSelect(): void;
  selected?: boolean;
  truncate?: boolean;
}

export const ChoiceOption = ({ id, selected = false, onSelect, children, inline = false, truncate = false }: Props) => {
  const { settings } = useSettingsEnvironment();
  const { glassSettings, uosAppearance } = useStore(settings);
  const label = (
    <span
      class={
        styles.label +
        (inline ? " " + styles.inline : "") +
        (truncate ? " " + styles.singleLine + " " + text.truncate : "")
      }
    >
      {children}
    </span>
  );
  if (glassSettings && uosAppearance) {
    return (
      <GlassChoice id={id} selected={selected} onSelect={onSelect}>
        {label}
      </GlassChoice>
    );
  }
  return (
    <SettingsControl class={styles.option} focusKey={id} role="button" aria-pressed={selected} onClick={onSelect}>
      {label}
    </SettingsControl>
  );
};
