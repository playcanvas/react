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
  playground: {
    type: 'menu',
    title: 'Playground',
    items: {
      "Basic" : {
        type: 'separator',
      },
      'model-viewer' : '',
      'physics' : '',
      'motion' : '',
      "Advanced" : {
        type: 'separator',
      },
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