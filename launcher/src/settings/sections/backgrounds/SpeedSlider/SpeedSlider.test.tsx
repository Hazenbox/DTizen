import { fireEvent, screen } from "@testing-library/preact";
import { expect, test, vi } from "vitest";

import { createNavigation } from "../../../../shared/navigation/createNavigation";
import { renderWithEnglish } from "../../../../test/renderWithEnglish";

import { SpeedSlider } from "./SpeedSlider";

const navigation = createNavigation(() => undefined);
vi.mock("../../../hooks/useSettingsEnvironment", () => ({
  useSettingsEnvironment: () => ({ navigation }),
}));

test("shows directional hints only while adjusting the speed", () => {
  const onSelect = vi.fn();
  const props = { min: 0.25, max: 2, step: 0.25, value: 1, onSelect };
  const { rerender } = renderWithEnglish(<SpeedSlider {...props} adjusting={false} />);
  const slider = screen.getByRole("slider", { name: "Background speed", value: { now: 1 } });
  expect(slider.querySelector("[data-slider-hint] svg")).toBeNull();
  fireEvent.click(slider);
  expect(onSelect).toHaveBeenCalledTimes(1);

  rerender(<SpeedSlider {...props} adjusting />);
  const arrows = slider.querySelectorAll('[data-slider-hint] svg[aria-hidden="true"]');
  expect(arrows).toHaveLength(2);
  expect(slider.querySelector(".lucide-chevron-left")).not.toBeNull();
  expect(slider.querySelector(".lucide-chevron-right")).not.toBeNull();
});

test("draws Glisse's slider, which reports a pointer change, when UOS supplies onChange", () => {
  const onChange = vi.fn();
  renderWithEnglish(
    <SpeedSlider min={0.25} max={2} step={0.25} value={1} adjusting={false} onSelect={vi.fn()} onChange={onChange} />,
  );
  const input = document.querySelector<HTMLInputElement>(".lg-slider input[type=range]");
  expect(input).not.toBeNull();
  expect(input?.getAttribute("tabindex")).toBe("-1");
  fireEvent.change(input!, { target: { value: "1.5" } });
  expect(onChange).toHaveBeenCalledWith(1.5);
  expect(document.querySelector("[data-slider-hint]")).not.toBeNull();
});
