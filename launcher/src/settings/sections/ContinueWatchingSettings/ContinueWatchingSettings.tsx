import type { ContinueSource } from "../../../contracts/launcher";
import type { MessageKey } from "../../../shared/i18n/catalogues";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ChoiceGroup } from "../../components/ChoiceGroup";
import { SettingsHint } from "../../components/SettingsHint/SettingsHint";
import { SettingsSection } from "../../components/SettingsSection/SettingsSection";
import type { SettingsSectionProps, SettingsServices } from "../../types";
import { AppOption } from "../apps/AppOption/AppOption";

import styles from "./ContinueWatchingSettings.module.css";

// YouTube never joins the row. Keep this in step with isExcluded in js/continue-watching.js.
const EXCLUDED_SOURCE = /youtube/i;

const CONTINUE_WATCHING_OPTIONS = [
  { value: false, labelKey: "common.off" },
  { value: true, labelKey: "common.on" },
] as const;

interface Props extends SettingsSectionProps {
  active: boolean;
  describeApp: SettingsServices["describeApp"];
  message: MessageKey | "";
  sources: readonly ContinueSource[];
}

export const ContinueWatchingSettings = ({ settings, actions, sources, message, active, describeApp }: Props) => {
  const { t } = useTranslation();
  const choices = sources.filter((source) => !EXCLUDED_SOURCE.test(source.id + " " + source.name));
  const visible = choices.map((source) => source.id);
  return (
    <SettingsSection title={t("home.continueWatching")} description={t("continue.hint")} label={t("continue.settings")}>
      <ChoiceGroup
        id="continue-watching"
        label={t("home.continueWatching")}
        value={settings.continueWatching === true}
        options={CONTINUE_WATCHING_OPTIONS}
        onSelect={actions.setContinueWatching}
      />
      {settings.continueWatching && (
        <>
          {choices.length > 0 && <SettingsHint>{t("continue.chooseApps")}</SettingsHint>}
          {message && <SettingsHint role="status">{t(message)}</SettingsHint>}
          <div class={styles.apps}>
            {choices.map((source) => (
              <AppOption
                key={source.id}
                app={source}
                focusKey={"continue-app:" + source.id}
                variant="source"
                selected={settings.continueWatchingAll || settings.continueWatchingApps.includes(source.id)}
                active={active}
                disabled={!source.storeId}
                onSelect={() => actions.toggleContinueApp(source.id, visible)}
                describeApp={describeApp}
              />
            ))}
          </div>
        </>
      )}
    </SettingsSection>
  );
};
