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
  // playground: {
  //   type: 'menu',
  //   title: 'Playground',
  //   items: {
  //     "---" : {
  //       title: 'Basic',
  //       type: 'separator',
  //     },
  //     'model-viewer' : '',
  //     'physics' : '',
  //     'motion' : '',
  //   },
  // },  
  company: {
    title: 'Company',
    type: 'menu',
    items: {
      about: {
        title: 'About',
        href: '/about'
      },
      '---' : {
        type: 'separator',
        title: 'More',
      },
      contact: {
        title: 'Contact Us',
        href: 'mailto:hi@example.com'
      }
    }
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