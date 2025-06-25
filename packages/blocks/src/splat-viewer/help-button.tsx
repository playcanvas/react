"use client"

import { Button } from "@components/ui/button"
import { useAssetViewer } from "./splat-viewer-context.tsx"

function HelpButton() {

  const { setOverlay } = useAssetViewer()

  return (
    <Button className="cursor-pointer pointer-events-auto" onClick={() => setOverlay("help")} variant="ghost" size="icon">
      ?
    </Button>
  )
}

export { HelpButton };