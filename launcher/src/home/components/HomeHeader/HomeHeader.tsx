import { House, Settings } from "lucide-preact";

import { useStore } from "../../../shared/hooks/useStore";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Icon } from "../../../shared/icons/Icon/Icon";
import { HeaderStatus } from "../../../status/HeaderStatus/HeaderStatus";
import { NetworkStatus } from "../../../status/NetworkStatus/NetworkStatus";
import { Glass } from "../../../vendor/glisse/glass";
import type { HomeEnvironment } from "../../types";
import { GlassTabs } from "../GlassTabs/GlassTabs";
import { HeaderFocusIndicator } from "../HeaderFocusIndicator/HeaderFocusIndicator";
import { HomeControl } from "../HomeControl/HomeControl";

import styles from "./HomeHeader.module.css";

export const HomeHeader = ({ env }: { env: HomeEnvironment }) => {
  const { t } = useTranslation();
  const { page, active } = useStore(env.state);
  const { unread } = useStore(env.updates);
  const settings = useStore(env.settings);
  const uos = settings.glassSettings && settings.uosAppearance;
  const settingsTitle = t(unread ? "settings.about.homeNotice" : "common.settings");
  return (
    <header
      class={styles.header}
      data-home-header
      data-expanded={settings.clockLayout === "custom" ? "true" : "false"}
      aria-hidden={!active}
    >
      <div class={styles.shortcuts} data-header-shortcuts>
        <HeaderFocusIndicator env={env} />
        <HomeControl
          env={env}
          id="gear"
          controlKey="gear"
          className={styles.shortcut}
          preserveSelection
          title={settingsTitle}
        >
          {uos && <Glass className={styles.shortcutGlass} aria-hidden="true" />}
          <Icon icon={Settings} />
          {unread && <span class={styles.notice} data-home-update-notice aria-hidden="true" />}
        </HomeControl>
        <HomeControl
          env={env}
          id="samsung-home-shortcut"
          controlKey="samsung-home-shortcut"
          className={styles.shortcut + " " + styles.nativeShortcut}
          title={t("common.samsungHome")}
        >
          {uos && <Glass className={styles.shortcutGlass} aria-hidden="true" />}
          <Icon icon={House} />
        </HomeControl>
        <NetworkStatus status={env.status} />
      </div>
      <nav class={styles.tabs} data-header-tabs data-glass={uos ? "true" : "false"} aria-label={t("home.views")}>
        {uos ? (
          <GlassTabs
            env={env}
            label={t("home.views")}
            tabs={[
              { page: "home", label: t("home.home") },
              { page: "apps", label: t("home.allApps") },
            ]}
          />
        ) : (
          <>
            <HeaderFocusIndicator env={env} group="tabs" />
            <HomeControl
              env={env}
              id="home-tab"
              controlKey="home-tab"
              className={styles.tab}
              title={t("home.home")}
              pressed={page === "home"}
            >
              {t("home.home")}
            </HomeControl>
            <HomeControl
              env={env}
              id="apps-tab"
              controlKey="apps-tab"
              className={styles.tab}
              title={t("home.allApps")}
              pressed={page === "apps"}
            >
              {t("home.allApps")}
            </HomeControl>
          </>
        )}
      </nav>
      <HeaderStatus settings={env.settings} status={env.status} clock={env.runtime.clock} />
    </header>
  );
};
