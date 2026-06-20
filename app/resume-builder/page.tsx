import {
  canExportResumeWord,
  canUseResumeAi,
  getCurrentUserWithRole,
} from "@/lib/admin";
import {
  getResumeAiPublicEnabled,
  getResumeWordExportPublicEnabled,
  getToolSettings,
  isToolAccessible,
} from "@/lib/tool-settings";
import { ToolMaintenancePage } from "@/components/tool-maintenance-page";
import { ToolDisabledPage } from "@/components/tool-disabled-page";
import { ResumeBuilderClient } from "./ResumeBuilderClient";

export default async function ResumeBuilderPage() {
  const auth = await getCurrentUserWithRole();
  const [wordExportPublic, aiPublic] = await Promise.all([
    getResumeWordExportPublicEnabled(),
    getResumeAiPublicEnabled(),
  ]);
  const role = auth?.profile?.role;
  const canExportWord = canExportResumeWord(role) || wordExportPublic;
  const canUseAi = canUseResumeAi(role) || aiPublic;

  const toolSettings = await getToolSettings();
  const { accessible, maintenance } = isToolAccessible(
    toolSettings,
    "resumebuilder"
  );

  if (!accessible) {
    if (maintenance) {
      return <ToolMaintenancePage toolName="CV / Resume Builder" />;
    }
    return <ToolDisabledPage toolName="CV / Resume Builder" />;
  }

  return (
    <ResumeBuilderClient canExportWord={canExportWord} canUseAi={canUseAi} />
  );
}
