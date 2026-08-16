import { MeasureApp } from "@areamap/components/MeasureApp";
import { getToolSettings, isToolAccessible } from "@/lib/tool-settings";
import { ToolMaintenancePage } from "@/components/tool-maintenance-page";
import { ToolDisabledPage } from "@/components/tool-disabled-page";

export default async function AreaMapPage() {
  const toolSettings = await getToolSettings();
  const { accessible, maintenance } = isToolAccessible(
    toolSettings,
    "areamap",
  );

  if (!accessible) {
    if (maintenance) {
      return <ToolMaintenancePage toolName="PlotMeasure" />;
    }
    return <ToolDisabledPage toolName="PlotMeasure" />;
  }

  // Full-viewport map; Averonsoft chrome is hidden for this route in root layout.
  return <MeasureApp />;
}
