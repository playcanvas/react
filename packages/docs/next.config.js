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
})

export default withNextra({
  reactStrictMode: true,
  transpilePackages: ['next-mdx-remote-client', 'playcanvas'],
  redirects: async () => [
    {
      source: '/examples',
      destination: '/examples/model-viewer',
      permanent: true
    },
    {
      source: '/',
      destination: '/docs',
      permanent: true
    }
  ]
})