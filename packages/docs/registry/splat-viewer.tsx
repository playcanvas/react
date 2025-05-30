import { Viewer } from "@playcanvas/blocks"

const splatUrl = "https://d28zzqy0iyovbz.cloudfront.net/30b943d5/scene.compressed.ply"

export function SplatViewer() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4"> 
        <Viewer.Splat src={splatUrl} className="rounded-lg shadow-xl cursor-grab active:cursor-grabbing" >
          <Viewer.Controls >
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
      </div>
    )
  }