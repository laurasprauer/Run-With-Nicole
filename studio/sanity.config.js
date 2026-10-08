import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {netlifyTool} from 'sanity-plugin-netlify'
import {DocumentsIcon, MenuIcon} from '@sanity/icons'
import {schemaTypes} from './schemaTypes'

// Singleton: exactly one navigation document with this fixed id.
const NAVIGATION_ID = 'navigation'

export default defineConfig({
  name: 'default',
  title: 'Run With Nicole',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.documentTypeListItem('page').title('Pages').icon(DocumentsIcon),
            S.listItem()
              .title('Header & Footer')
              .icon(MenuIcon)
              .child(S.document().schemaType('navigation').documentId(NAVIGATION_ID)),
          ]),
    }),
    // "Deploy" tab: rebuild the live site on demand (build hook + Site ID + access
    // token are entered once inside the tool; stored as private `netlify.*` docs)
    netlifyTool(),
  ],

  // No content releases for this site — hides the Releases tab and release menus
  releases: {enabled: false},

  schema: {
    types: schemaTypes,
    // Don't offer "create new navigation" — it's a singleton
    templates: (templates) => templates.filter(({schemaType}) => schemaType !== 'navigation'),
  },

  document: {
    newDocumentOptions: (prev) => prev.filter((item) => item.templateId !== 'navigation'),
  },
})
