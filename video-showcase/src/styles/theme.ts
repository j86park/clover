/**
 * Clover Showcase - Emerald Theme Configuration
 * 
 * Centralized theme system for consistent branding across all video scenes.
 */

export const theme = {
    colors: {
        primary: {
            DEFAULT: '#10b981',
            dark: '#059669',
            light: '#34d399',
        },
        accent: {
            light: '#6ee7b7',
            dark: '#047857',
            darkest: '#065f46',
        },
        background: {
            primary: '#0f172a',
            secondary: '#1e293b',
            tertiary: '#334155',
        },
        text: {
            primary: '#f8fafc',
            secondary: '#94a3b8',
            muted: '#64748b',
        },
    },
    fonts: {
        heading: 'Inter, system-ui, sans-serif',
        body: 'Inter, system-ui, sans-serif',
        mono: 'JetBrains Mono, monospace',
    },
    timing: {
        fast: 0.2,
        normal: 0.4,
        slow: 0.8,
    },
    spacing: {
        xs: 8,
        sm: 16,
        md: 32,
        lg: 64,
        xl: 128,
    },
} as const;

// Type exports for TypeScript safety
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeFonts = typeof theme.fonts;
