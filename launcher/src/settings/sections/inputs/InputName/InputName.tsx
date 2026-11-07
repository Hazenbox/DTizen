import "../../../../vendor/glisse/styles.css";

import { useTextInput } from "../../../../shared/hooks/useTextInput";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { Input } from "../../../../vendor/glisse/input";
import { SettingsControl } from "../../../components/SettingsControl/SettingsControl";
import type { SettingsActions } from "../../../types";

import styles from "./InputName.module.css";

interface Props {
  actions: SettingsActions;
  // Set with UOS: Glisse's input.
  glass?: boolean;
  name?: string;
  placeholder?: string;
  port: string;
}

export const InputName = ({ port, name, placeholder, actions, glass = false }: Props) => {
  const { t } = useTranslation();
  const { focus, ...input } = useTextInput(name || "", (value) => actions.saveInputName(port, value));
  return (
    <SettingsControl class={styles.control} focusKey={"name:" + port} onClick={focus}>
      <span class={styles.port}>{port}</span>
      {glass ? (
        <Input
          {...input}
          className={styles.glisse}
          type="text"
          maxLength={24}
          placeholder={placeholder || t("inputs.addName")}
          aria-label={t("inputs.nameLabel", { port })}
        />
      ) : (
        <input
          {...input}
          class={styles.field}
          type="text"
          maxLength={24}
          placeholder={placeholder || t("inputs.addName")}
          aria-label={t("inputs.nameLabel", { port })}
        />
      )}
    </SettingsControl>
  );
};
