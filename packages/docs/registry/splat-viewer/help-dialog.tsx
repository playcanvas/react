import * as React from "react"
import { useAssetViewer } from "./splat-viewer-context"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Table, TableHeader, TableBody, TableCell, TableRow, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tabs } from "@/components/ui/tabs"
import { CameraModeToggle } from "./menu-button"
import { Card } from "@/components/ui/card"

export function useMediaQuery(query: string) {
  const [value, setValue] = React.useState(false)

  React.useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches)
    }

    const result = matchMedia(query)
    result.addEventListener("change", onChange)
    setValue(result.matches)

    return () => result.removeEventListener("change", onChange)
  }, [query])

  return value
}
  
function CameraHelpTable() {

  const { mode } = useAssetViewer()

  return (
    <>
      <TabsContent value="keyboard">  
        { mode === "orbit" ? (
          <ControlSection controls={[
            ["Orbit", "Left Mouse"],
            ["Pan", "Right Mouse"],
            ["Zoom", "Mouse Wheel"],
          ]} />
        ) : (
          <ControlSection controls={[
            ["Orbit", "Left Mouse"],
            ["Forward / Backward", <div className="flex gap-2" key="forward-backward">
              <Badge variant="secondary" >W</Badge>
              <Badge variant="secondary" >S</Badge>
            </div>],
            // ["Backward", <Badge variant="secondary" key="backward">S</Badge>],
            ["Left / Right", <div className="flex gap-2" key="left-right">
              <Badge variant="secondary" >A</Badge>
              <Badge variant="secondary" >D</Badge>
            </div>],
            ["Up / Down", <div className="flex gap-2" key="up-down">
              <Badge variant="secondary" >Q</Badge>
              <Badge variant="secondary" >E</Badge>
            </div>],
          ]} />
        )}
      </TabsContent>
      <TabsContent value="touch">
        { mode === "orbit" ? (<ControlSection controls={[
          ["Orbit", "One Finger Drag"],
          ["Pan", "Two Finger Drag"],
          ["Zoom", "Pinch"],
          // ["Focus", "Double Tap"],
        ]} />) : (
          <ControlSection controls={[
            ["Look Around", "Touch on Right"],
            ["Fly", "Touch on Left"],
          ]} />
        )}
      </TabsContent>
    </>
  )
}
  
function ControlSection({ controls }: { controls: [string, string | React.ReactNode][] }) {
  return (
    <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Input</TableHead>
        <TableHead className="text-right">Action</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {controls.map(([label, key]) => (
        <TableRow key={label}>
          <TableCell className="text-muted-foreground">{key}</TableCell>
          <TableCell className="text-right font-medium">{label}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
  )
}
  
export function HelpDialog() {
  const { overlay, setOverlay } = useAssetViewer()
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Dialog open={overlay === "help"} onOpenChange={() => setOverlay(null)}>
        <DialogContent className="max-w-md" aria-label="Camera Controls">
          <DialogHeader>
            <DialogTitle>Camera Controls</DialogTitle>
            <DialogDescription>Use these controls to navigate.</DialogDescription>
          </DialogHeader>
          <Card className="p-2 my-2 opacity-90">
            <CameraModeToggle />
          </Card>
          <Tabs defaultValue="keyboard">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="keyboard" className="data-[state=active]:bg-background">Keyboard</TabsTrigger>
              <TabsTrigger value="touch" className="data-[state=active]:bg-background">Touch</TabsTrigger>
            </TabsList>
            <CameraHelpTable />
          </Tabs>
        </DialogContent>
      </Dialog>
    )
  }
  
  return (
    <Drawer 
      open={overlay === "help"} 
      onOpenChange={() => setOverlay(null)} 
      shouldScaleBackground={true} 
      setBackgroundColorOnScale={true}
      >
      <DrawerContent className="min-h-[320px]">
        <div className="mx-auto w-full max-w-sm  pb-18">
          <DrawerHeader>
            <DrawerTitle>Controls</DrawerTitle>
            <DrawerDescription>Use these controls to navigate.</DrawerDescription>
          </DrawerHeader>
          <Card className="p-2 m-4 my-2 opacity-90">
            <CameraModeToggle />
          </Card>
          <div className="p-4">
            <Tabs defaultValue="keyboard">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="keyboard" className="data-[state=active]:bg-background">Keyboard</TabsTrigger>
                <TabsTrigger value="touch" className="data-[state=active]:bg-background">Touch</TabsTrigger>
              </TabsList>
              <CameraHelpTable />
            </Tabs>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}