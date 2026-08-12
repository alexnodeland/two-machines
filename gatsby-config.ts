import type { GatsbyConfig } from 'gatsby'

// The ONLY place the prefix is written (ADR-029). The site is a GitHub Pages
// project page at alexnodeland.github.io/two-machines; builds must also pass
// --prefix-paths (the build script does). If a custom domain ever arrives,
// the change is to DELETE this and ADD a CNAME — never both at once.
const pathPrefix = '/two-machines'

const config: GatsbyConfig = {
  pathPrefix,
  siteMetadata: {
    title: 'Two Machines',
    description:
      'A guide to tape-delay looping — the technique Fripp named Frippertronics — taught by letting you play it in the page.',
    siteUrl: 'https://alexnodeland.github.io/two-machines',
  },
  graphqlTypegen: true,
  plugins: [
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'content',
        path: `${__dirname}/src/content`,
      },
    },
    'gatsby-plugin-mdx',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'Two Machines',
        short_name: 'Two Machines',
        start_url: '/',
        display: 'minimal-ui',
        icon: 'src/images/icon.png',
      },
    },
  ],
}

export default config
