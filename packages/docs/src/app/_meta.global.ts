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
      'model-viewer' : '',
      'physics' : '',
      'motion' : '',
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