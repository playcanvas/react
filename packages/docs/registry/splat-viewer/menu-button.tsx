"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMediaQuery } from "./help-dialog";
import { EllipsisVerticalIcon, DownloadIcon, MinimizeIcon, MaximizeIcon, HelpCircleIcon, Rotate3dIcon, Move3DIcon } from "lucide-react";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { useState } from "react";
import { useAssetViewer } from "./splat-viewer-context";
import { ToggleGroupItem } from "@/components/ui/toggle-group";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

function MenuItemsDesktop({
    mode,
    setMode,
    setOverlay,
    triggerDownload,
    toggleFullscreen
  }: ReturnType<typeof useAssetViewer>) {
    return (
      <>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOverlay("help")}>
            Help
            <DropdownMenuShortcut>⇧F</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => triggerDownload()}>
            Download
            <DropdownMenuShortcut>⇧⌘D</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toggleFullscreen()}>
            Fullscreen
            <DropdownMenuShortcut>⇧⌘F</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuCheckboxItem
            checked={true}
            disabled
          >
            Auto Rotate
            <DropdownMenuShortcut>⇧⌘R</DropdownMenuShortcut>
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
  
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Controls</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={mode} onValueChange={setMode}>
            <DropdownMenuRadioItem value="orbit">
              Orbit
              <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="fly">
              Fly
              <DropdownMenuShortcut>⌘F</DropdownMenuShortcut>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </>
    )
  }

  export function CameraModeToggle() {
    const { mode, setMode } = useAssetViewer();

    const safeSetMode = (mode: string) => {
        if (mode === "orbit" || mode === "fly") {
            setMode(mode);
        }
    }

    return (
        <div className="flex items-center justify-between px-2 py-2 text-foreground">
            <div className="flex gap-1 flex-col">
                <span className="font-medium">Camera mode</span>
                <div className="text-muted-foreground text-xs">
                    { mode === "orbit" && <span>Great for inspecting an object.</span> }
                    { mode === "fly" && <span>Ideal for navigating larger scenes.</span> }
                </div>
            </div>
            <ToggleGroup type="single" value={mode} onValueChange={safeSetMode} className="bg-muted p-1 rounded-lg">
                <ToggleGroupItem value="orbit" className="px-3 py-1 rounded-md data-[state=on]:bg-background">
                    <Rotate3dIcon />
                </ToggleGroupItem>
                <ToggleGroupItem value="fly" className="px-3 py-1 rounded-md data-[state=on]:bg-background">
                    <Move3DIcon />
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
    )
  }

  function MenuItemsMobile({
    setOverlay,
    triggerDownload,
    toggleFullscreen,
    isFullscreen,
    autoRotate,
    setAutoRotate
  }: ReturnType<typeof useAssetViewer>) {


    return (
      <div className="space-y-2 text-sm">
        
        <Card className="m-4 px-2 py-2">
            <CameraModeToggle />
        </Card>

        {/* Auto rotate */}
        <Card className="m-4 mb-8 p-4">
            <div className="flex items-center justify-between ">
                <div className="flex flex-col gap-1">
                    <span className="font-medium">Auto rotate</span>
                    <span className="text-muted-foreground text-xs">
                        { autoRotate 
                            ? <span>Automatically rotate the camera around the object.</span> 
                            : <span>Disable automatic rotation.</span> 
                        }
                    </span>
                </div>
                <Switch id="auto-rotate" checked={autoRotate} onCheckedChange={() => setAutoRotate(!autoRotate)}/>
            </div>
        </Card>

        <Separator />
        
        <div className="p-2 text-sm">
          <h4 className="my-2 mb-4 text-muted-foreground text-xs font-semibold px-2">Settings</h4>
          <Button variant="ghost" onClick={() => setOverlay("help")} className="w-full justify-between">
            Help
            <DropdownMenuShortcut>
                <HelpCircleIcon />
            </DropdownMenuShortcut>
          </Button>
          <Button variant="ghost" className="w-full justify-between" onClick={() => triggerDownload()}>
            Download
            <DropdownMenuShortcut>
                <DownloadIcon />
            </DropdownMenuShortcut>
          </Button>
          <Button variant="ghost" className="w-full justify-between" onClick={() => toggleFullscreen()}>
            { isFullscreen ? "Exit Fullscreen" : "Fullscreen" }
            <DropdownMenuShortcut>
                { isFullscreen ? <MinimizeIcon /> : <MaximizeIcon /> }
            </DropdownMenuShortcut>
          </Button>
        </div>
      </div>
    )
  }

function MenuButton() {

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const props = useAssetViewer();
  const {overlay, setOverlay} = props
  
    if (isDesktop) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                    <EllipsisVerticalIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" className="w-56">
                    <MenuItemsDesktop {...props} />
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    return (
    <>
        <Button variant="ghost" size="icon" onClick={() => setOverlay("settings")}>
            <EllipsisVerticalIcon />
        </Button>
        <Drawer open={overlay === "settings"} onOpenChange={() => setOverlay(null)} shouldScaleBackground={true} setBackgroundColorOnScale={true}>
        <DrawerContent>
            <div className="mx-auto w-full max-w-md px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
                <DrawerHeader>
                    <DrawerTitle>Settings</DrawerTitle>
                    <DrawerDescription>Viewer options and controls.</DrawerDescription>
                </DrawerHeader>
                <MenuItemsMobile {...props} />
                <DrawerFooter>
                    <DrawerClose asChild></DrawerClose>
                </DrawerFooter>
            </div>
        </DrawerContent>
        </Drawer>
    </>
    )   
}

export { MenuButton }