import { useStore } from "../../shared/hooks/useStore";
import type { MessageKey } from "../../shared/i18n/catalogues";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSettingsEnvironment } from "../hooks/useSettingsEnvironment";

import { ChoiceOption } from "./ChoiceOption/ChoiceOption";
import { ControlGroup } from "./ControlGroup/ControlGroup";
import { GlassSegmented } from "./GlassSegmented/GlassSegmented";

interface Props<T extends string | boolean> {
  grid?: boolean;
  id: string;
  label: string;
  onSelect: (value: T) => void;
  options: ReadonlyArray<{ readonly value: T } & ({ readonly label: string } | { readonly labelKey: MessageKey })>;
  value: T;
}

// A few short choices read as one Glisse segmented control in UOS: up to four segments, each
// wide enough for the longest label, in no more than the pane's width.
const MAX_SEGMENTS = 4;
const MAX_WIDTH = 940;
const segmentWidthFor = (longest: number) => Math.max(150, longest * 15 + 64);

export const ChoiceGroup = <T extends string | boolean>({ id, value, options, onSelect, label, grid }: Props<T>) => {
  const { t } = useTranslation();
  const { settings } = useSettingsEnvironment();
  const { glassSettings, uosAppearance } = useStore(settings);
  const labels = options.map((option) => ("labelKey" in option ? t(option.labelKey) : option.label));
  const segmentWidth = segmentWidthFor(Math.max(...labels.map((text) => text.length)));
  if (
    glassSettings &&
    uosAppearance &&
    !grid &&
    options.length <= MAX_SEGMENTS &&
    options.length * segmentWidth <= MAX_WIDTH
  ) {
    return (
      <GlassSegmented
        id={id}
        label={label}
        value={String(value)}
        segmentWidth={segmentWidth}
        options={options.map((option, index) => ({ value: String(option.value), label: labels[index] ?? "" }))}
        onSelect={(selected) => {
          const option = options.find((item) => String(item.value) === selected);
          if (option) {
            onSelect(option.value);
          }
        }}
      />
    );
  }
  return (
    <ControlGroup id={id} label={label} grid={grid}>
      {options.map((option, index) => (
        <ChoiceOption
          key={String(option.value)}
          id={id + ":" + option.value}
          selected={value === option.value}
          onSelect={() => onSelect(option.value)}
        >
          {labels[index]}
        </ChoiceOption>
      ))}
    </ControlGroup>
  );
};
