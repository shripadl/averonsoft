import { SmartImageResizerClient } from '@/components/tools/smart-image-resizer/SmartImageResizerClient'
import { getToolSettings, isToolAccessible } from '@/lib/tool-settings'
import { ToolMaintenancePage } from '@/components/tool-maintenance-page'
import { ToolDisabledPage } from '@/components/tool-disabled-page'
import type { Metadata } from 'next'

const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Smart Image Toolkit',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web',
  featureList: [
    'Content-aware image resize',
    'Image splitting / grid tiling',
    'AI background removal',
  ],
  offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
}

export const metadata: Metadata = {
  title: 'Smart Image Toolkit | Resize, Split & Remove Background | Averonsoft Tools',
  description:
    'All-in-one in-browser image toolkit: content-aware resize, grid/tile splitting (Instagram-ready), and AI background removal. 100% local processing — your images never leave your device.',
  openGraph: {
    title: 'Smart Image Toolkit | Averonsoft Tools',
    description:
      'Resize, split, and remove backgrounds — all in your browser. Content-aware, privacy-first.',
  },
}

export default async function SmartImageResizerPage() {
  const toolSettings = await getToolSettings()
  const { accessible, maintenance } = isToolAccessible(toolSettings, 'smartimageresizer')

  if (!accessible) {
    if (maintenance) {
      return <ToolMaintenancePage toolName="Smart Image Toolkit" />
    }
    return <ToolDisabledPage toolName="Smart Image Toolkit" />
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Smart Image Toolkit</h1>
        <p className="mt-2 text-muted-foreground">
          Content-aware resize, grid/tile splitting, and AI background removal — all running locally in your browser.
        </p>
      </div>

      <SmartImageResizerClient />
    </div>
  )
}
