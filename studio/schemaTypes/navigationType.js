import {defineArrayMember, defineField, defineType} from 'sanity'
import {MenuIcon} from '@sanity/icons'

// Singleton (fixed id "navigation" — see sanity.config.js).
export const navigationType = defineType({
  name: 'navigation',
  title: 'Header & Footer',
  type: 'document',
  icon: MenuIcon,
  fields: [
    defineField({
      name: 'links',
      title: 'Header links',
      description: 'Each link scrolls to a section. Use "#" + the section\'s Container ID, e.g. #pricing.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'navLink',
          fields: [
            defineField({name: 'label', type: 'string', validation: (rule) => rule.required()}),
            defineField({
              name: 'link',
              type: 'string',
              description: 'e.g. #how-it-works, #about, #pricing, #contact',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'displayAsButton',
              title: 'Display as button',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {select: {title: 'label', subtitle: 'link'}},
        }),
      ],
    }),
    defineField({
      name: 'footerEmail',
      title: 'Footer email',
      type: 'string',
      validation: (rule) => rule.email(),
    }),
  ],
  preview: {prepare: () => ({title: 'Header & Footer'})},
})
