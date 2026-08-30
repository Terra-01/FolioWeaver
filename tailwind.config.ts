// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            // This configuration links the typography plugin's elements to the custom CSS variables defined in globals.css.
            '--tw-prose-body': 'var(--color-text-secondary)',
            '--tw-prose-headings': 'var(--color-text-primary)',
            '--tw-prose-lead': 'var(--color-text-secondary)',
            '--tw-prose-links': 'var(--color-accent-primary)',
            '--tw-prose-bold': 'var(--color-text-primary)',
            '--tw-prose-counters': 'var(--color-text-muted)',
            '--tw-prose-bullets': 'var(--color-text-muted)',
            '--tw-prose-hr': 'var(--color-border-primary)',
            '--tw-prose-quotes': 'var(--color-text-secondary)',
            '--tw-prose-quote-borders': 'var(--color-border-primary)',
            '--tw-prose-captions': 'var(--color-text-muted)',
            '--tw-prose-code': 'var(--color-text-primary)',
            '--tw-prose-pre-code': 'var(--color-text-primary)',
            '--tw-prose-pre-bg': 'var(--color-bg-tertiary)',
            '--tw-prose-th-borders': 'var(--color-border-primary)',
            '--tw-prose-td-borders': 'var(--color-border-primary)',
            '--tw-prose-invert-body': 'var(--color-text-secondary)',
            '--tw-prose-invert-headings': 'var(--color-text-primary)',
            '--tw-prose-invert-lead': 'var(--color-text-secondary)',
            '--tw-prose-invert-links': 'var(--color-accent-primary)',
            '--tw-prose-invert-bold': 'var(--color-text-primary)',
            '--tw-prose-invert-counters': 'var(--color-text-muted)',
            '--tw-prose-invert-bullets': 'var(--color-text-muted)',
            '--tw-prose-invert-hr': 'var(--color-border-primary)',
            '--tw-prose-invert-quotes': 'var(--color-text-secondary)',
            '--tw-prose-invert-quote-borders': 'var(--color-border-primary)',
            '--tw-prose-invert-captions': 'var(--color-text-muted)',
            '--tw-prose-invert-code': 'var(--color-text-primary)',
            '--tw-prose-invert-pre-code': 'var(--color-text-primary)',
            '--tw-prose-invert-pre-bg': 'var(--color-bg-tertiary)',
            '--tw-prose-invert-th-borders': 'var(--color-border-primary)',
            '--tw-prose-invert-td-borders': 'var(--color-border-primary)',
          },
        },
      },
    },
  },
  
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;