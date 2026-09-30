import type { Config } from 'tailwindcss';

/**
 * Design tokens from docs/HANDOFF.md §2, plus the secondary greys and accent
 * tints used verbatim in docs/design/*.reference.html.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // §2 core tokens
        bg: '#F4F6FA',
        surface: '#FFFFFF',
        border: '#E6E9F0',
        ink: {
          DEFAULT: '#111827', // text
          2: '#374151',
          3: '#4B5563',
          muted: '#6B7280', // text-muted
          faint: '#9CA3AF',
        },
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          soft: '#E8EFFE',
          tint: '#E3ECFD',
        },
        // Secondary neutrals from the references
        line: {
          control: '#E1E5EE', // input / dropdown borders
          divider: '#EEF0F4',
          row: '#F1F3F7',
        },
        track: '#EEF1F6', // progress bar background
        chip: '#F1F3F7', // build chip background
        field: '#FAFBFD', // search input background
        bubble: '#F6F7FA', // comment background
        hover: '#F1F4FA', // nav hover

        // Kanban lanes: head / lane / text
        lane: {
          pending: { head: '#DDE8FC', bg: '#F5F8FE', text: '#1E3A8A' },
          progress: { head: '#FCEFC9', bg: '#FFFBF1', text: '#78350F' },
          active: { head: '#D5F0DE', bg: '#F3FBF5', text: '#14532D', rule: '#B7E1C3' },
          changed: { head: '#E9E3FB', bg: '#F8F6FE', text: '#4C1D95' },
        },

        // Area tags: bg / text
        area: {
          programming: { bg: '#DBEAFE', text: '#1D4ED8' },
          art: { bg: '#FCE7F3', text: '#BE185D' },
          design: { bg: '#EDE9FE', text: '#6D28D9' },
          audio: { bg: '#CCFBF1', text: '#0F766E' },
          uiux: { bg: '#FEF3C7', text: '#92400E' },
          qa: { bg: '#FEE2E2', text: '#B91C1C' },
          animation: { bg: '#FFEDD5', text: '#C2410C' },
          narrative: { bg: '#DCFCE7', text: '#15803D' },
        },

        // Priority: bg / text
        priority: {
          high: { bg: '#FEE2E2', text: '#B91C1C', tile: '#FDE8E8', bar: '#DC2626' },
          medium: { bg: '#FEF3C7', text: '#92400E', tile: '#FDF1D3', bar: '#F59E0B' },
          low: { bg: '#E0E7FF', text: '#3730A3', tile: '#E3ECFD', bar: '#2563EB' },
        },

        // Done-state badges: bg / text
        done: {
          active: { bg: '#DCFCE7', text: '#15803D', tile: '#DDF3E4', bar: '#16A34A', label: '#14532D' },
          modified: { bg: '#EDE9FE', text: '#6D28D9', tile: '#EDE7FB', bar: '#7C3AED', label: '#4C1D95' },
          removed: { bg: '#FEE2E2', text: '#B91C1C', tile: '#FDE8E8', bar: '#DC2626', label: '#991B1B' },
        },

        // "Próximas entregas" cards: border / bg / text
        deadline: {
          urgent: { border: '#FCA5A5', bg: '#FEF2F2', text: '#B91C1C' },
          soon: { border: '#93B4F6', bg: '#EFF4FE', text: '#1D4ED8' },
          build: { border: '#86D0A0', bg: '#F0FAF3', text: '#15803D' },
        },

        // Semantic accents used in stats / activity highlights
        success: { DEFAULT: '#15803D', tint: '#DDF3E4' },
        warning: { DEFAULT: '#B45309', tint: '#FDF1D3', dot: '#F59E0B' },
        danger: { DEFAULT: '#B91C1C', dot: '#DC2626' },
        violet: { DEFAULT: '#6D28D9', tint: '#EDE7FB' },

        // User avatar colors (users.avatar_color)
        avatar: {
          blue: '#2563EB',
          violet: '#7C3AED',
          pink: '#DB2777',
          teal: '#0F766E',
          orange: '#C2410C',
          red: '#B91C1C',
          slate: '#1F2937',
        },
      },
      borderRadius: {
        card: '16px', // radius-card
        task: '10px', // radius-task
      },
      boxShadow: {
        panel: '0 1px 3px rgba(16,24,40,.04)',
        task: '0 1px 2px rgba(16,24,40,.05)',
        selected: '0 0 0 3px rgba(37,99,235,.16)',
      },
    },
  },
  plugins: [],
} satisfies Config;
