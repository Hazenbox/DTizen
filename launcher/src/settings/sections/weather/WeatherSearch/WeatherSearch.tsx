import "../../../../vendor/glisse/styles.css";

import type { JSX, RefObject } from "preact";

import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { Input } from "../../../../vendor/glisse/input";
import { SettingsControl } from "../../../components/SettingsControl/SettingsControl";

import styles from "./WeatherSearch.module.css";

interface Props {
  // Set with UOS: Glisse's input.
  glass?: boolean;
  inputRef: RefObject<HTMLInputElement>;
  onInput: JSX.GenericEventHandler<HTMLInputElement>;
  onSelect(): void;
  value: string;
}

export const WeatherSearch = ({ glass = false, inputRef, onInput, onSelect, value }: Props) => {
  const { t } = useTranslation();
  return (
    <SettingsControl
      class={styles.search}
      data-glass={glass ? "true" : undefined}
      focusKey="weather:query"
      onClick={onSelect}
    >
      {glass ? (
        <Input
          className={styles.glisse}
          ref={inputRef}
          type="text"
          maxLength={80}
          value={value}
          placeholder={t("weather.searchPlaceholder")}
          aria-label={t("weather.locationLabel")}
          onInput={onInput}
        />
      ) : (
        <input
          class={styles.input}
          ref={inputRef}
          type="text"
          maxLength={80}
          value={value}
          placeholder={t("weather.searchPlaceholder")}
          aria-label={t("weather.locationLabel")}
          onInput={onInput}
        />
      )}
    </SettingsControl>
  );
};
