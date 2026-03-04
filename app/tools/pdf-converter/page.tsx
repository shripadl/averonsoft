import { PdfConverterClient } from '@/components/tools/pdf-converter-client'
import { getToolSettings, isToolAccessible } from '@/lib/tool-settings'
import { ToolMaintenancePage } from '@/components/tool-maintenance-page'
import { ToolDisabledPage } from '@/components/tool-disabled-page'

export const metadata = {
  title: 'PDF Converter | Averonsoft Tools',
  description:
    'Convert images, text to PDF. Merge, split, compress PDFs. PDF to images. All processing in your browser. No uploads.',
}

export default async function PdfConverterPage() {
  const toolSettings = await getToolSettings()
  const { accessible, maintenance } = isToolAccessible(toolSettings, 'pdfconverter')

  if (!accessible) {
    if (maintenance) {
      return <ToolMaintenancePage toolName="PDF Converter" />
    }
    return <ToolDisabledPage toolName="PDF Converter" />
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">PDF Converter</h1>
        <p className="mt-2 text-muted-foreground">
          Convert images, text to PDF. Merge, split, compress. All in your browser. No data stored.
        </p>
      </div>

      <PdfConverterClient />
    </div>
  )
}
