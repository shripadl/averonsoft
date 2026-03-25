import { SmartImageResizerClient } from '@/components/tools/smart-image-resizer/SmartImageResizerClient'
import { getToolSettings, isToolAccessible } from '@/lib/tool-settings'
import { ToolMaintenancePage } from '@/components/tool-maintenance-page'
import { ToolDisabledPage } from '@/components/tool-disabled-page'
import type { Metadata } from 'next'

const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Smart Image Resizer',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
}

export const metadata: Metadata = {
  title: 'Smart Image Resizer | Resize Without Cropping | Averonsoft Tools',
  description:
    'Resize images to new aspect ratios without stretching or cropping. Content-aware seam carving. Protect faces and logos. All processing in your browser. No uploads.',
  openGraph: {
    title: 'Smart Image Resizer | Averonsoft Tools',
    description: 'Resize images without cropping. Content-aware. 100% in browser.',
  },
}

export default async function SmartImageResizerPage() {
  const toolSettings = await getToolSettings()
  const { accessible, maintenance } = isToolAccessible(toolSettings, 'smartimageresizer')

  if (!accessible) {
    if (maintenance) {
      return <ToolMaintenancePage toolName="Smart Image Resizer" />
    }
    return <ToolDisabledPage toolName="Smart Image Resizer" />
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Smart Image Resizer</h1>
        <p className="mt-2 text-muted-foreground">
          Resize images to new aspect ratios without stretching or cropping important content.
        </p>
      </div>

      <SmartImageResizerClient />
    </div>
  )
}
