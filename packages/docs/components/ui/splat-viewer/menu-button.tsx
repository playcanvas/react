"use client";

import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EllipsisVerticalIcon } from "lucide-react";
import { useState } from "react";

function MenuButton() {

    const [autoRotate, setAutoRotate] = useState(true);

    return (
        <DropdownMenu>
            <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuTrigger asChild>
                <Button className="cursor-pointer pointer-events-auto" variant="ghost" size="icon">
                    <EllipsisVerticalIcon />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuItem>
                    Fullscreen
                    <DropdownMenuShortcut>⇧⌘F</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    Download
                    <DropdownMenuShortcut>⇧⌘D</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuCheckboxItem
                    checked={autoRotate}
                    onCheckedChange={setAutoRotate}
                    disabled
                    >
                    Auto Rotate
                    <DropdownMenuShortcut>⇧⌘R</DropdownMenuShortcut>
                </DropdownMenuCheckboxItem>
                
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export { MenuButton };