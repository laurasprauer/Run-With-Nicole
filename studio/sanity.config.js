import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
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
  ],

  schema: {
    types: schemaTypes,
    // Don't offer "create new navigation" — it's a singleton
    templates: (templates) => templates.filter(({schemaType}) => schemaType !== 'navigation'),
  },

  document: {
    newDocumentOptions: (prev) => prev.filter((item) => item.templateId !== 'navigation'),
  },
})
