import nextra from 'nextra'

const withNextra = nextra({
  mdxOptions: {
    rehypePrettyCodeOptions: {
      theme: {
        dark: 'slack-dark',
        light: 'slack-ochin'
      }
    }
  },
  latex: true,
  search: {
    codeblocks: false
  },
  contentDirBasePath: '/playground',
})

export default withNextra({
  reactStrictMode: true,
  transpilePackages: [/*'next-mdx-remote', */'next-mdx-remote-client', 'playcanvas'],
  redirects: async () => [
    {
        source: '/playground',
        destination: '/playground/model-viewer',
        permanent: true
    },
    {
      source: '/',
      destination: '/docs',
      permanent: true
    }
  ]
})