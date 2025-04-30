import type { MetaRecord } from 'nextra'

// examples list
const examplesList = {
  // "Basic" : {
  //   type: 'separator',
  // },
  'hello-world': {
    title: 'Hello World',
    href: '/examples/hello-world'
  },
  'load-a-3D-model' : {
    title : 'Load a 3D model',
    href: '/examples/load-a-3D-model'
  },
  'primitives' : {
    title: 'Primitives',
    href: '/examples/primitives'
  },
  'pointer-events' : {
    href: '/examples/pointer-events'
  },
  // "Advanced" : {
  //   type: 'separator',
  // },
  'model-viewer' : {
    href: '/examples/model-viewer'
  },
  'splats' : {
    title: "Splat Viewer",
    href: '/examples/splats'
  },
  'physics' : {
    href: '/examples/physics'
  },
  'motion' : {
    href: '/examples/motion'
  },
}

const meta: MetaRecord = {
  docs: {
    title: 'Docs',
    type: 'page',
    theme: {
        sidebar: true,
    }
  },
  examples: {
    title: 'Examples',
    type: 'menu',
    items: examplesList
  },
  '': {
    type: 'separator',
  },
  faq: {},
  github_link: {
    title: 'PlayCanvas Docs',
    href: 'https://developer.playcanvas.com'
  },
}


export default meta;