import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentIcon} from '@sanity/icons'
import {BgColorSelector} from '../components/BgColorSelector'
import {IconSelector} from '../components/IconSelector'

// Page component types. Keep in sync with the registry in
// src/app/components/mainContent/component.js.
const COMPONENTS = [
  {title: 'Hero (profile photo)', value: 'hero'},
  {title: 'Image With Text', value: 'imageWithText'},
  {title: 'Icon Boxes', value: 'iconBoxes'},
  {title: 'Text Boxes', value: 'textBoxes'},
  {title: 'Pricing', value: 'pricing'},
  {title: 'Banner (text + button)', value: 'ctaBanner'},
  {title: 'Contact Form', value: 'contactForm'},
]
const componentLabel = (value) => COMPONENTS.find((c) => c.value === value)?.title || value

// Show a field only for the listed component types.
const onlyFor =
  (...types) =>
  ({parent}) =>
    !types.includes(parent?.pageComponent)

// Rich text used by every section body: headings, bold/italic, links.
const richText = (options = {}) =>
  defineArrayMember({
    type: 'block',
    styles: [
      {title: 'Normal', value: 'normal'},
      {title: 'Heading 1', value: 'h1'},
      {title: 'Heading 2', value: 'h2'},
      {title: 'Heading 3', value: 'h3'},
      {title: 'Heading 4', value: 'h4'},
    ],
    marks: {
      annotations: [
        {
          name: 'link',
          type: 'object',
          title: 'Link',
          fields: [
            {
              name: 'href',
              type: 'string',
              title: 'URL',
              description: 'https://…, mailto:…, or a section like #contact',
            },
          ],
        },
      ],
    },
    ...options,
  })

const imageWithAlt = (name, title, hidden) =>
  defineField({
    name,
    title,
    type: 'image',
    options: {hotspot: true},
    hidden,
    fields: [
      defineField({
        name: 'alt',
        title: 'Alt text',
        type: 'string',
        description: 'Describe the image for screen readers. Leave empty if decorative.',
      }),
    ],
  })

export const pageType = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    {name: 'main', title: 'Main', default: true},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      group: 'main',
      description: 'Internal only — not shown on the site.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'main',
      description: 'Use "/" for the home page.',
      validation: (rule) => rule.required(),
    }),

    // --- SEO ---
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      group: 'seo',
      description: 'Browser tab + Google title. 20–60 characters. Falls back to the site default.',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description: 'Google snippet. 150–220 characters. Falls back to the site default.',
    }),
    defineField({
      name: 'shareImage',
      title: 'Share image',
      type: 'image',
      group: 'seo',
      description: 'Preview image when the link is shared (1200×630 recommended).',
    }),
    defineField({
      name: 'noindex',
      title: 'Hide from search engines',
      type: 'boolean',
      group: 'seo',
      initialValue: false,
    }),

    // --- Page content ---
    defineField({
      name: 'mainContent',
      title: 'Page content',
      type: 'array',
      group: 'main',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'pageComponentObject',
          title: 'Section',
          fields: [
            defineField({
              name: 'title',
              type: 'string',
              description: 'Internal only — helps you find this section in the list.',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'pageComponent',
              title: 'Component type',
              type: 'string',
              options: {list: COMPONENTS, layout: 'radio'},
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'containerId',
              title: 'Container ID',
              type: 'string',
              description:
                'Anchor for header links, lowercase-with-dashes (e.g. "pricing" → link to #pricing).',
              validation: (rule) =>
                rule.regex(/^[a-z0-9-]+$/, {name: 'lowercase letters, numbers, dashes'}),
            }),
            defineField({
              name: 'componentBgColor',
              title: 'Background color',
              type: 'string',
              initialValue: 'white',
              options: {list: ['white', 'offWhite', 'teal', 'navy']},
              components: {input: BgColorSelector},
            }),
            defineField({
              name: 'body',
              title: 'Text',
              type: 'array',
              of: [richText()],
            }),

            // --- Image (Hero: round profile photo — set the hotspot to frame the face;
            //     Image With Text: see position/fit below) ---
            imageWithAlt('componentImage', 'Image', onlyFor('hero', 'imageWithText')),
            defineField({
              name: 'backgroundImage',
              title: 'Background image (optional)',
              type: 'image',
              options: {hotspot: true},
              description:
                'Covers the whole hero behind the photo and text, with a navy → sky → teal color overlay. Overrides the background color. The header sits on top of it at the top of the page.',
              hidden: onlyFor('hero'),
            }),

            // --- Image With Text ---
            defineField({
              name: 'leftOrRight',
              title: 'Image position',
              type: 'string',
              initialValue: 'right',
              options: {
                list: [
                  {title: 'Image on the left', value: 'left'},
                  {title: 'Image on the right', value: 'right'},
                ],
                layout: 'radio',
                direction: 'horizontal',
              },
              hidden: onlyFor('imageWithText'),
            }),
            defineField({
              name: 'imageFit',
              title: 'Image fit',
              type: 'string',
              initialValue: 'cover',
              options: {
                list: [
                  {title: 'Cover — fills half the section, edge to edge (may crop)', value: 'cover'},
                  {title: 'Contain — shows the full image, no cropping', value: 'contain'},
                  {title: 'Contain with color block — full image, with a teal-to-sky block set behind it', value: 'containOffset'},
                ],
                layout: 'radio',
              },
              hidden: onlyFor('imageWithText'),
            }),

            // --- Icon Boxes ---
            defineField({
              name: 'showStepNumbers',
              title: 'Show step numbers',
              type: 'boolean',
              initialValue: false,
              hidden: onlyFor('iconBoxes'),
            }),
            defineField({
              name: 'boxes',
              type: 'array',
              hidden: onlyFor('iconBoxes'),
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'iconBox',
                  fields: [
                    defineField({
                      name: 'icon',
                      type: 'string',
                      components: {input: IconSelector},
                    }),
                    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
                    defineField({name: 'text', type: 'text', rows: 3}),
                  ],
                  preview: {select: {title: 'title', subtitle: 'icon'}},
                }),
              ],
            }),

            // --- Text Boxes ---
            defineField({
              name: 'textBoxItems',
              title: 'Boxes',
              type: 'array',
              description: 'Shown 2 per row (stacked on phones).',
              hidden: onlyFor('textBoxes'),
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'textBox',
                  fields: [
                    defineField({name: 'title', type: 'string'}),
                    defineField({name: 'body', title: 'Text', type: 'array', of: [richText()]}),
                  ],
                  preview: {select: {title: 'title'}},
                }),
              ],
            }),

            // --- Pricing ---
            defineField({
              name: 'plans',
              type: 'array',
              hidden: onlyFor('pricing'),
              validation: (rule) => rule.max(3).warning('The layout is designed for up to 3 plans.'),
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'plan',
                  fields: [
                    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
                    defineField({name: 'price', type: 'string', description: 'e.g. "$150" or "From $150"'}),
                    defineField({name: 'priceNote', type: 'string', description: 'e.g. "/ month"'}),
                    defineField({name: 'description', type: 'text', rows: 3}),
                    defineField({
                      name: 'features',
                      type: 'array',
                      of: [
                        defineArrayMember({
                          type: 'object',
                          name: 'feature',
                          fields: [
                            defineField({name: 'text', type: 'string'}),
                            defineField({
                              name: 'included',
                              type: 'boolean',
                              initialValue: true,
                              description: 'Off = shown with an ✗ (e.g. "No adjustments provided").',
                            }),
                          ],
                          preview: {
                            select: {title: 'text', included: 'included'},
                            prepare: ({title, included}) => ({
                              title: `${included === false ? '✗' : '✓'} ${title || ''}`,
                            }),
                          },
                        }),
                      ],
                    }),
                    defineField({
                      name: 'table',
                      title: 'Price table (optional)',
                      type: 'object',
                      options: {collapsible: true, collapsed: true},
                      fields: [
                        defineField({
                          name: 'collapsible',
                          title: 'Hide behind a "View" toggle',
                          type: 'boolean',
                          initialValue: false,
                        }),
                        defineField({
                          name: 'toggleLabel',
                          type: 'string',
                          description: 'e.g. "View pacing fees"',
                          hidden: ({parent}) => !parent?.collapsible,
                        }),
                        defineField({
                          name: 'columns',
                          title: 'Column headings',
                          type: 'array',
                          of: [defineArrayMember({type: 'string'})],
                        }),
                        defineField({
                          name: 'rows',
                          type: 'array',
                          of: [
                            defineArrayMember({
                              type: 'object',
                              name: 'tableRow',
                              fields: [
                                defineField({
                                  name: 'cells',
                                  type: 'array',
                                  of: [defineArrayMember({type: 'string'})],
                                }),
                              ],
                              preview: {
                                select: {cells: 'cells'},
                                prepare: ({cells}) => ({title: (cells || []).join(' · ')}),
                              },
                            }),
                          ],
                        }),
                      ],
                    }),
                    defineField({name: 'footnote', type: 'text', rows: 2}),
                  ],
                  preview: {select: {title: 'title', subtitle: 'price'}},
                }),
              ],
            }),

            // --- Banner ---
            defineField({
              name: 'downloadFile',
              title: 'Download file (optional)',
              type: 'file',
              description:
                'e.g. the waiver PDF. When set, the button downloads this file (and the Button link is ignored).',
              hidden: onlyFor('ctaBanner'),
            }),

            // --- Contact Form ---
            defineField({
              name: 'submitButtonLabel',
              title: 'Submit button label',
              type: 'string',
              description: 'Text on the form\'s submit button. Defaults to "Send Inquiry".',
              hidden: onlyFor('contactForm'),
            }),
            defineField({
              name: 'successMessage',
              title: 'Success message',
              type: 'text',
              rows: 2,
              description: 'Shown after the inquiry form is sent.',
              hidden: onlyFor('contactForm'),
            }),

            // --- Button (hero, image with text, pricing, banner) ---
            defineField({
              name: 'componentButtonLabel',
              title: 'Button label',
              type: 'string',
              hidden: onlyFor('hero', 'imageWithText', 'pricing', 'ctaBanner'),
            }),
            defineField({
              name: 'componentButtonLink',
              title: 'Button link',
              type: 'string',
              description: 'e.g. #contact or https://…',
              hidden: onlyFor('hero', 'imageWithText', 'pricing', 'ctaBanner'),
            }),

            // --- Spacing ---
            defineField({
              name: 'removeTopPadding',
              title: 'Remove top padding',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'removeBottomPadding',
              title: 'Remove bottom padding',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: {title: 'title', component: 'pageComponent', id: 'containerId'},
            prepare: ({title, component, id}) => ({
              title,
              subtitle: [componentLabel(component), id && `#${id}`].filter(Boolean).join(' · '),
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'title', slug: 'slug.current'},
    prepare: ({title, slug}) => ({title, subtitle: slug}),
  },
})
