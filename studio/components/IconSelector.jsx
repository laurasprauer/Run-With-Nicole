import React from 'react'
import {set, unset} from 'sanity'
import {Box, Flex, Grid, Text} from '@sanity/ui'

// Icon picker for Icon Boxes. MIRRORS the content icons in
// src/app/components/svg/svgs.js — keep keys + drawings in sync when adding icons.
const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const ICONS = [
  {
    value: 'chat',
    label: 'Chat',
    icon: (
      <>
        <path d="M4 4h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        <path d="M18 8h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1v3l-4-3h-3a2 2 0 0 1-2-2" />
      </>
    ),
  },
  {
    value: 'clipboard',
    label: 'Clipboard',
    icon: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <rect x="9" y="2" width="6" height="4" rx="1" />
        <path d="M9 11h6M9 15h4" />
      </>
    ),
  },
  {
    value: 'calendar',
    label: 'Calendar',
    icon: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </>
    ),
  },
  {value: 'flag', label: 'Flag', icon: <path d="M5 21V4h11l-2 4 2 4H5" />},
  {
    value: 'target',
    label: 'Target',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
  },
  {value: 'chart', label: 'Chart', icon: <path d="M4 20h16M7 16v-4M12 16V8M17 16V5" />},
  {
    value: 'magnifier',
    label: 'Magnifier',
    icon: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="M20 20l-4.5-4.5" />
      </>
    ),
  },
  {
    value: 'stopwatch',
    label: 'Stopwatch',
    icon: (
      <>
        <circle cx="12" cy="14" r="7" />
        <path d="M12 14v-3.5M10 3h4M12 3v4M18.5 7.5l1-1" />
      </>
    ),
  },
  {
    value: 'heart',
    label: 'Heart',
    icon: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  },
]

export function IconSelector({value, onChange}) {
  return (
    <Box paddingY={2}>
      <Grid columns={[3, 5]} gap={2}>
        {ICONS.map((item) => {
          const isSelected = value === item.value
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange(isSelected ? unset() : set(item.value))}
              aria-pressed={isSelected}
              title={item.label}
              style={{
                cursor: 'pointer',
                borderRadius: 6,
                padding: 8,
                border: isSelected ? '2px solid #2fbcd0' : '2px solid #d5e1e8',
                background: isSelected ? '#eafafc' : '#fff',
                color: '#266090',
              }}
            >
              <Flex direction="column" align="center" gap={2}>
                <svg viewBox="0 0 24 24" width="32" height="32" {...stroke}>
                  {item.icon}
                </svg>
                <Text size={0}>{item.label}</Text>
              </Flex>
            </button>
          )
        })}
      </Grid>
    </Box>
  )
}
