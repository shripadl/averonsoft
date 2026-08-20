import { SatbaraApp } from "@satbara/components/SatbaraApp";
import { getToolSettings, isToolAccessible } from "@/lib/tool-settings";
import { ToolMaintenancePage } from "@/components/tool-maintenance-page";
import { ToolDisabledPage } from "@/components/tool-disabled-page";

export default async function SatbaraPage() {
  const toolSettings = await getToolSettings();
  const { accessible, maintenance } = isToolAccessible(
    toolSettings,
    "satbara",
  );

  if (!accessible) {
    if (maintenance) {
      return <ToolMaintenancePage toolName="Satbara" />;
    }
    return <ToolDisabledPage toolName="Satbara" />;
  }

  return <SatbaraApp />;
}
