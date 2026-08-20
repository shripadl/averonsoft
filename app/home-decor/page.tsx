import { DecorApp } from "@homedecor/components/DecorApp";
import { getToolSettings, isToolAccessible } from "@/lib/tool-settings";
import { ToolMaintenancePage } from "@/components/tool-maintenance-page";
import { ToolDisabledPage } from "@/components/tool-disabled-page";

export default async function HomeDecorPage() {
  const toolSettings = await getToolSettings();
  const { accessible, maintenance } = isToolAccessible(
    toolSettings,
    "homedecor",
  );

  if (!accessible) {
    if (maintenance) {
      return <ToolMaintenancePage toolName="RoomScale" />;
    }
    return <ToolDisabledPage toolName="RoomScale" />;
  }

  return <DecorApp />;
}
