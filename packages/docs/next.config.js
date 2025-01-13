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

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['next-mdx-remote-client', 'playcanvas'],
  async headers() {
    return [
        {
            // matching all API routes
            source: "/",
            headers: [
                { key: "Access-Control-Allow-Credentials", value: "true" },
                { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
                { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
            ]
        }
    ]
  },
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
}

export default nextConfig
// export default withNextra(nextConfig)