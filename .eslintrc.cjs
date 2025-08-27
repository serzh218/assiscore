module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import', 'jsx-a11y'],
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  ignorePatterns: [
    'types/**',
    'tests/**',
    'test/**',
    'scripts/**',
    'app/**',
    'components/**',
    'lib/**',
    'templates/**',
    'eslint.config.cjs',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    'import/order': ['warn', { 'newlines-between': 'always', alphabetize: { order: 'asc' } }],
    'jsx-a11y/alt-text': 'warn',
    'jsx-a11y/iframe-has-title': 'warn',
    'react/react-in-jsx-scope': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  overrides: [
    {
      files: ['app/**/*.{ts,tsx}', 'server/**/*.{ts,tsx}'],
      rules: {
        'import/no-default-export': 'error',
      },
    },
    {
      files: ['app/**/*{page,layout,loading,error,not-found,route}.{ts,tsx}'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
  ],
}
