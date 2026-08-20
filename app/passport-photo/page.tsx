import { PassPhotoApp } from "@passphoto/components/PassPhotoApp";
import { getToolSettings, isToolAccessible } from "@/lib/tool-settings";
import { ToolMaintenancePage } from "@/components/tool-maintenance-page";
import { ToolDisabledPage } from "@/components/tool-disabled-page";

export default async function PassportPhotoPage() {
  const toolSettings = await getToolSettings();
  const { accessible, maintenance } = isToolAccessible(
    toolSettings,
    "passportphoto",
  );

  if (!accessible) {
    if (maintenance) {
      return <ToolMaintenancePage toolName="PhotoSpec" />;
    }
    return <ToolDisabledPage toolName="PhotoSpec" />;
  }

  return <PassPhotoApp />;
}
