import { fireEvent, render, screen } from "@testing-library/preact";
import { expect, test, vi } from "vitest";

import { createNavigation } from "../../../shared/navigation/createNavigation";
import { createStore } from "../../../shared/state/createStore";

import { ChoiceOption } from "./ChoiceOption";

const navigation = createNavigation(() => undefined);
const settings = createStore({ glassSettings: false, uosAppearance: false });

vi.mock("../../hooks/useSettingsEnvironment", () => ({
  useSettingsEnvironment: () => ({ navigation, settings }),
}));

test("exposes its selection state and calls onSelect when clicked", () => {
  const label = "24-hour time";
  const onSelect = vi.fn();
  const { rerender } = render(
    <ChoiceOption id="time:24" onSelect={onSelect}>
      {label}
    </ChoiceOption>,
  );

  const option = screen.getByRole("button", { name: label, pressed: false });
  fireEvent.click(option);
  expect(onSelect).toHaveBeenCalledTimes(1);

  rerender(
    <ChoiceOption id="time:24" onSelect={onSelect} selected>
      {label}
    </ChoiceOption>,
  );
  expect(screen.getByRole("button", { name: label }).getAttribute("aria-pressed")).toBe("true");
});

test("is Glisse's button in UOS, still focusable and selectable by the remote", () => {
  settings.set({ glassSettings: true, uosAppearance: true });
  const label = "24-hour time";
  const onSelect = vi.fn();
  render(
    <ChoiceOption id="time:24" onSelect={onSelect} selected>
      {label}
    </ChoiceOption>,
  );
  const option = screen.getByRole("button", { name: label });
  expect(option.classList.contains("lg-button")).toBe(true);
  expect(option.getAttribute("data-key")).toBe("time:24");
  expect(option.getAttribute("aria-pressed")).toBe("true");
  expect(option.getAttribute("data-variant")).toBe("filled");
  fireEvent.click(option);
  expect(onSelect).toHaveBeenCalledTimes(1);
  settings.set({ glassSettings: false, uosAppearance: false });
});
