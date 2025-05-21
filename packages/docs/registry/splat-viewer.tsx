import { Viewer } from "@playcanvas/blocks"

const splatUrl = "https://playcanvas.com/models/splat/splat.splat"

export function SplatViewer() {
    return (
      <Viewer.Splat src={splatUrl} autoPlay className="rounded-t-lg lg:rounded-lg shadow-xl cursor-grab active:cursor-grabbing" >
        <Viewer.Controls autoHide >
          <div className="flex gap-1 pointer-events-auto flex-grow">
              <Viewer.FullScreenButton />
              <Viewer.DownloadButton />
          </div>
          <div className="flex gap-1 pointer-events-auto">
            <Viewer.CameraModeToggle />
            <Viewer.HelpButton />
            <Viewer.MenuButton />
          </div>
        </Viewer.Controls>
    </Viewer.Splat>
    )
  }