import "../../../vendor/glisse/styles.css";

import { useLayoutEffect, useRef } from "preact/hooks";

import { useStore } from "../../../shared/hooks/useStore";
import { TabBar } from "../../../vendor/glisse/tab-bar";
import type { HomeEnvironment, Page } from "../../types";

import styles from "./GlassTabs.module.css";

interface Props {
  env: HomeEnvironment;
  label: string;
  tabs: ReadonlyArray<{ readonly label: string; readonly page: Page }>;
}

// The keys Glisse's tab bar moves its selection with. The remote's keys go to Home instead,
// so moving focus along the header never changes the page: OK does.
const GLISSE_KEYS = new Set(["ArrowLeft", "ArrowRight", "Home", "End"]);

// Glisse's tab bar, with its Liquid Glass lens, as the header's Home and All apps tabs. Each of
// its tabs is a Home control, so the remote focuses it and OK opens it.
export const GlassTabs = ({ env, label, tabs }: Props) => {
  const { page, active, selected } = useStore(env.state);
  const wrap = useRef<HTMLDivElement>(null);
  const keys = tabs.map((tab) => tab.page + "-tab");
  const signature = keys.join("|");

  useLayoutEffect(() => {
    const nodes = Array.from(wrap.current?.querySelectorAll<HTMLElement>("[role=tab]") ?? []);
    nodes.forEach((node, index) => {
      const key = keys[index] ?? "";
      node.setAttribute("id", key);
      env.nodes.set(key, node);
    });
    return () => keys.forEach((key) => env.nodes.delete(key));
    // keys is derived from signature.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [env, signature]);

  useLayoutEffect(() => {
    const nodes = Array.from(wrap.current?.querySelectorAll<HTMLElement>("[role=tab]") ?? []);
    nodes.forEach((node, index) => {
      // Home keeps one control in the tab order; Glisse tabs the selected tab.
      const focused = active && selected === keys[index];
      node.setAttribute("tabindex", focused ? "0" : "-1");
      if (focused) {
        node.setAttribute("data-focused", "true");
      } else {
        node.removeAttribute("data-focused");
      }
    });
    // keys is derived from signature.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, selected, page, signature]);

  return (
    <div
      ref={wrap}
      class={styles.group}
      onKeyDownCapture={(event) => {
        if (GLISSE_KEYS.has(event.key)) {
          event.stopPropagation();
          env.bridge.keydown(event.keyCode, event);
        }
      }}
    >
      <TabBar
        className={styles.bar}
        aria-label={label}
        items={tabs.map((tab) => ({ value: tab.page, label: tab.label }))}
        value={page}
        onValueChange={(next) => {
          const key = next + "-tab";
          env.select(key);
          env.activate(key);
        }}
      />
    </div>
  );
};
