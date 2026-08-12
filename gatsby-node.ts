import path from 'node:path'
import type { GatsbyNode } from 'gatsby'

// Chapters are MDX files in src/content, routed by their frontmatter slug
// through the chapter template (which puts the instruments and the
// claim-marking chrome in scope).

interface MdxNode {
  id: string
  frontmatter: { slug: string; title: string; part: string }
  internal: { contentFilePath: string }
}

export const createPages: GatsbyNode['createPages'] = async ({
  graphql,
  actions,
  reporter,
}) => {
  const template = path.resolve('./src/templates/chapter.tsx')
  const result = await graphql<{ allMdx: { nodes: MdxNode[] } }>(`
    query Chapters {
      allMdx {
        nodes {
          id
          frontmatter {
            slug
            title
            part
          }
          internal {
            contentFilePath
          }
        }
      }
    }
  `)

  if (result.errors || !result.data) {
    reporter.panicOnBuild('Failed to load chapter MDX', result.errors)
    return
  }

  for (const node of result.data.allMdx.nodes) {
    actions.createPage({
      path: node.frontmatter.slug,
      component: `${template}?__contentFilePath=${node.internal.contentFilePath}`,
      context: { id: node.id, frontmatter: node.frontmatter },
    })
  }
}
