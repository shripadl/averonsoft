import { CalculatorApp } from "@payframe/components/CalculatorApp";
import { getToolSettings, isToolAccessible } from "@/lib/tool-settings";
import { ToolMaintenancePage } from "@/components/tool-maintenance-page";
import { ToolDisabledPage } from "@/components/tool-disabled-page";

export default async function UkTaxCalculatorPage() {
  const toolSettings = await getToolSettings();
  const { accessible, maintenance } = isToolAccessible(
    toolSettings,
    "uktaxcalculator",
  );

  if (!accessible) {
    if (maintenance) {
      return <ToolMaintenancePage toolName="UK Tax Calculator" />;
    }
    return <ToolDisabledPage toolName="UK Tax Calculator" />;
  }

  return <CalculatorApp />;
}
