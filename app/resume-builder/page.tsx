import { getToolSettings, isToolAccessible } from "@/lib/tool-settings";
import { ToolMaintenancePage } from "@/components/tool-maintenance-page";
import { ToolDisabledPage } from "@/components/tool-disabled-page";
import { ResumeBuilderClient } from "./ResumeBuilderClient";

export default async function ResumeBuilderPage() {
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

  return <ResumeBuilderClient />;
}
