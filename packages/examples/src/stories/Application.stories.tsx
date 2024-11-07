import type { Meta, StoryObj } from '@storybook/react';
import { Application } from '@pc-react';
import { FILLMODE_FILL_WINDOW, FILLMODE_KEEP_ASPECT, FILLMODE_NONE, RESOLUTION_AUTO, RESOLUTION_FIXED } from 'playcanvas';
import { GlbViewer } from '../GlbViewer';
import { Story } from '@storybook/blocks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Leva } from 'leva';

const queryClient = new QueryClient()

const meta: Meta<typeof Application> = {
    title: 'Example/Application',
    component: Application,
    subcomponents: { GlbViewer },
    decorators: [(Story) => <>
        <div onMouseMove={e => e.stopPropagation() } >
            <Leva hidden/>
        </div>
        <QueryClientProvider client={queryClient}>
            <Story/>
        </QueryClientProvider>
    </>
    ],
    parameters: {
      layout: 'fullscreen',
    },
    tags: ['autodocs'],
    argTypes: {
        fillMode: { control: 'select', options: [FILLMODE_NONE, FILLMODE_FILL_WINDOW, FILLMODE_KEEP_ASPECT] },
        resolutionMode: { control: 'select', options: [RESOLUTION_AUTO, RESOLUTION_FIXED] },
        maxDeltaTime: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
        timeScale: { control: { type: 'range', min: 0, max: 2, step: 0.01 } }
    }
};

type Story = StoryObj<typeof Application>

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
    args: {
        className: 'pc-app',
        style: { width: '100%', height: '100%' },
        fillMode: FILLMODE_NONE,
        resolutionMode: RESOLUTION_AUTO,
        maxDeltaTime: 0.1,
        timeScale: 1,
        graphicsDeviceOptions: {
            alpha: true,
            depth: true,
            stencil: true,
            antialias: true,
            premultipliedAlpha: true,
            preserveDrawingBuffer: false,
            powerPreference: 'default',
            failIfMajorPerformanceCaveat: false,
            desynchronized: false,
            xrCompatible: false,
        }
    },
    render: (args) => (
        <Application {...args}>
          <GlbViewer src='/lamborghini_vision_gt.glb' envMapSrc='/environment-map.png'/>
        </Application>
    ),
};

export default meta;

