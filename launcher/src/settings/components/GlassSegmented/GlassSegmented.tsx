import "../../../vendor/glisse/styles.css";

import { flushSync } from "preact/compat";
import { useContext, useLayoutEffect, useRef } from "preact/hooks";

import type { MessageKey } from "../../../shared/i18n/catalogues";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { focusControl } from "../../../shared/navigation/focusControl";
import { SegmentedControl } from "../../../vendor/glisse/segmented-control";
import { FocusedControlContext } from "../../context";
import { useSettingsEnvironment } from "../../hooks/useSettingsEnvironment";

import styles from "./GlassSegmented.module.css";

interface Props<T extends string> {
  id: string;
  label: string;
  onSelect: (value: T) => void;
  options: ReadonlyArray<{ readonly value: T } & ({ readonly label: string } | { readonly labelKey: MessageKey })>;
  // A segment's width in px; Glisse gives every segment the same width.
  segmentWidth?: number;
  value: T;
}

// The keys Glisse's segmented control moves its selection with. The remote's keys go to
// Settings navigation instead, so moving focus never changes the choice: OK does.
const GLISSE_KEYS = new Set(["ArrowLeft", "ArrowRight", "Home", "End"]);

// Glisse's segmented control, with its Liquid Glass lens, as a Settings choice. Each of
// its segments is a Settings control, so the remote focuses them and OK picks one.
export const GlassSegmented = <T extends string>({ id, label, value, options, onSelect, segmentWidth }: Props<T>) => {
  const { t } = useTranslation();
  const { bridge, navigation } = useSettingsEnvironment();
  const focusedKey = useContext(FocusedControlContext);
  const wrap = useRef<HTMLDivElement>(null);
  const items = options.map((option) => ({
    value: option.value,
    label: "labelKey" in option ? t(option.labelKey) : option.label,
  }));
  const keys = options.map((option) => id + ":" + option.value);
  const signature = keys.join("|");

  useLayoutEffect(() => {
    const segments = Array.from(wrap.current?.querySelectorAll<HTMLElement>("[role=radio]") ?? []);
    const focusListeners = segments.map((segment, index) => {
      const key = keys[index] ?? "";
      segment.setAttribute("data-key", key);
      navigation.register(key, segment);
      const onFocus = () => flushSync(() => navigation.select(key));
      segment.addEventListener("focus", onFocus);
      return () => segment.removeEventListener("focus", onFocus);
    });
    return () => {
      focusListeners.forEach((remove) => remove());
      keys.forEach((key) => navigation.register(key, null));
    };
    // keys is derived from signature.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, signature]);

  useLayoutEffect(() => {
    const segments = Array.from(wrap.current?.querySelectorAll<HTMLElement>("[role=radio]") ?? []);
    segments.forEach((segment, index) => {
      // Settings keeps one control in the tab order; Glisse tabs the selected segment.
      if (keys[index] === focusedKey) {
        segment.setAttribute("data-focused", "true");
        segment.setAttribute("tabindex", "0");
        focusControl(segment);
      } else {
        segment.removeAttribute("data-focused");
        segment.setAttribute("tabindex", "-1");
      }
    });
    // keys is derived from signature.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedKey, signature, value]);

  return (
    <div
      id={id}
      ref={wrap}
      class={styles.group}
      onKeyDownCapture={(event) => {
        if (GLISSE_KEYS.has(event.key)) {
          event.stopPropagation();
          bridge.keydown(event.keyCode, event);
        }
      }}
    >
      <SegmentedControl
        className={styles.bar}
        items={items}
        value={value}
        onValueChange={(next) => onSelect(next as T)}
        aria-label={label}
        style={segmentWidth ? { "--lg-tab-width": segmentWidth + "px" } : undefined}
      />
    </div>
  );
};
