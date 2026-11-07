import type { AppearanceStyle, SettingsSnapshot } from "../../contracts/preferences";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ChoiceGroup } from "../components/ChoiceGroup";
import { GlassSegmented } from "../components/GlassSegmented/GlassSegmented";
import { SettingsSection } from "../components/SettingsSection/SettingsSection";
import type { SettingsSectionProps } from "../types";

const APPEARANCE_OPTIONS = [
  { value: "classic", labelKey: "appearance.classic" },
  { value: "glass", labelKey: "appearance.glass" },
  { value: "uos", labelKey: "appearance.uos" },
] as const;

const appearanceOf = ({ glassSettings, uosAppearance }: SettingsSnapshot): AppearanceStyle => {
  if (!glassSettings) {
    return "classic";
  }
  return uosAppearance ? "uos" : "glass";
};

const HOME_CARD_COLUMNS_OPTIONS = [
  { value: "5", labelKey: "appearance.small" },
  { value: "4", labelKey: "appearance.medium" },
  { value: "3", labelKey: "appearance.large" },
] as const;

const HOME_APP_LAYOUT_OPTIONS = [
  { value: "grid", labelKey: "appearance.grid" },
  { value: "scroll", labelKey: "appearance.scroll" },
] as const;

export const AppearanceSettings = ({ settings, actions }: SettingsSectionProps) => {
  const { t } = useTranslation();
  return (
    <>
      <SettingsSection title={t("appearance.title")}>
        <GlassSegmented
          id="settings-appearance"
          label={t("appearance.title")}
          value={appearanceOf(settings)}
          options={APPEARANCE_OPTIONS}
          onSelect={actions.setAppearance}
        />
      </SettingsSection>
      <SettingsSection title={t("appearance.size")}>
        <ChoiceGroup
          id="home-card-columns"
          label={t("appearance.size")}
          value={String(settings.homeCardColumns)}
          options={HOME_CARD_COLUMNS_OPTIONS}
          onSelect={(value) => actions.setHomeCardColumns(Number(value))}
        />
      </SettingsSection>
      <SettingsSection title={t("appearance.homeLayout")}>
        <ChoiceGroup
          id="home-app-layout"
          label={t("appearance.homeLayout")}
          value={settings.homeAppLayout}
          options={HOME_APP_LAYOUT_OPTIONS}
          onSelect={actions.setHomeAppLayout}
        />
      </SettingsSection>
    </>
  );
};
