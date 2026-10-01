import React from 'react'
import {set} from 'sanity'
import {Box, Flex, Grid, Text} from '@sanity/ui'

// Swatch picker for a section's `componentBgColor`.
// Adding a color: add it here AND to the section-bg mixin (src/app/styles/mixins/_layout.scss),
// getButtonTheme.js, and the schema's options.list in pageType.js.
const OPTIONS = [
  {value: 'white', label: 'White', color: '#ffffff'},
  {value: 'offWhite', label: 'Off-white', color: '#f3f8fa'},
  {value: 'teal', label: 'Teal', color: '#4ad5bb'},
  {value: 'navy', label: 'Navy', color: '#266090'},
]

export function BgColorSelector({value, onChange}) {
  return (
    <Box paddingY={2}>
      <Grid columns={[2, 4]} gap={3}>
        {OPTIONS.map((option) => {
          const isSelected = (value || 'white') === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(set(option.value))}
              aria-pressed={isSelected}
              style={{
                cursor: 'pointer',
                borderRadius: 6,
                padding: 6,
                border: isSelected ? '2px solid #2fbcd0' : '2px solid transparent',
                background: isSelected ? '#eafafc' : 'transparent',
              }}
            >
              <Flex direction="column" align="center" gap={2}>
                <div
                  style={{
                    width: '100%',
                    height: 44,
                    borderRadius: 4,
                    background: option.color,
                    border: '1px solid #d5e1e8',
                  }}
                />
                <Text size={1}>{option.label}</Text>
              </Flex>
            </button>
          )
        })}
      </Grid>
    </Box>
  )
}
