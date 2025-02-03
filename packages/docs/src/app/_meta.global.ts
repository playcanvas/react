const examples = {
  "Basic" : {
    type: 'separator',
  },
  'hello-world': {
    href: '/examples/hello-world'
  },
  'load-a-3D-model' : {
    title : 'Load a 3D model',
    href: '/examples/load-a-3D-model'
  },
  'primitives' : {
    href: '/examples/primitives'
  },
  'pointer-events' : {
    href: '/examples/pointer-events'
  },
  "Advanced" : {
    type: 'separator',
  },
  'model-viewer' : {
    href: '/examples/model-viewer'
  },
  'physics' : {
    href: '/examples/physics'
  },
  'motion' : {
    href: '/examples/motion'
  },
}


export default {
  docs: {
    type: 'page',
    title: 'Docs',
    items: {
      installation : 'Installation',
      guide : {
        items: {
          'getting-started' : '',
          'loading-assets' : ''
        },
      },
      api: {
        items: {
          'application' : '',
          'entity' : '',
          'components' : {
            items: {
              'camera' : '',
              'render' : '',
              'light' : ''
            },
          },
          'utils' : '',
        },
      },
    },
  },
  menuExample: {
    title: 'Examples',
    type: 'menu',
    items: examples
  },
  examples: {
    title: 'Examples',
    theme: {
      footer: false
    },
    items: {
      ...examples,
      'splats': {
        display: 'hidden'
      }
    },
  },
  '---': {
    type: 'separator',
    title: 'More',
  },
  faq: '',
  github_link: {
    title: 'PlayCanvas Docs',
    href: 'https://developer.playcanvas.com'
  },
}