import { defineConfig } from 'eslint/config';

import babelParser from '@babel/eslint-parser';
import globals from 'globals';
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import stylistic from '@stylistic/eslint-plugin';

// typescript-eslint doesn't support TypeScript 7, so TS / TSX are parsed with Babel.
// tsc (noUnusedLocals etc.) covers what the typescript-eslint rules would.

export default defineConfig([
	{
		ignores: [
			'build',
			'dist',
			'node_modules'
		]
	},
	{
		extends: [
			js.configs.recommended,
			stylistic.configs.recommended
		],
		files: [
			'**/*.{ts,tsx}'
		],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
			parser: babelParser,
			parserOptions: {
				requireConfigFile: false,
				babelOptions: {
					parserOpts: {
						plugins: [
							'typescript'
						]
					}
				}
			}
		},
		plugins: {
			'react-hooks': reactHooks
		},
		rules: {
			// Babel doesn't understand types (or JSX usage) here, and tsc already checks these
			'no-undef': 'off',
			'no-unused-vars': 'off',
			// Errors
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'error',
			'array-bracket-newline': [
				'error',
				'consistent'
			],
			'array-element-newline': [
				'error',
				'consistent'
			],
			'curly': [
				'error'
			],
			'no-trailing-spaces': [
				'error'
			],
			'object-curly-spacing': [
				'error',
				'always'
			],
			'quotes': [
				'error',
				'single'
			],
			// list-style replaces array-bracket-spacing in @stylistic 6
			'@stylistic/list-style': [
				'error',
				{
					overrides: {
						'[]': {
							singleLine: {
								spacing: 'always'
							}
						}
					}
				}
			],
			'@stylistic/arrow-parens': [
				'error',
				'as-needed'
			],
			'@stylistic/comma-dangle': [
				'error',
				'never'
			],
			'@stylistic/indent': [
				'error',
				'tab',
				{
					'SwitchCase': 1
				}
			],
			'@stylistic/jsx-quotes': [
				'error',
				'prefer-single'
			],
			'@stylistic/semi': [
				'error',
				'always'
			],
			// Warnings
			'no-console': [
				'warn',
				{
					'allow': [
						'warn',
						'error'
					]
				}
			],
			'no-debugger': 'warn',
			'no-warning-comments': [
				'warn',
				{
					'terms': [
						'todo',
						'hack',
						'fix',
						'fixme',
						'xxx'
					]
				}
			],
			'sort-imports': [
				'warn',
				{
					'allowSeparatedGroups': true,
					'memberSyntaxSortOrder': [
						'all',
						'multiple',
						'single',
						'none'
					]
				}
			],
			// Off
			'@stylistic/brace-style': [
				'off'
			],
			'@stylistic/indent-binary-ops': [
				'off'
			],
			'@stylistic/jsx-indent-props': [
				'off'
			],
			'@stylistic/jsx-one-expression-per-line': [
				'off'
			],
			'@stylistic/jsx-wrap-multilines': [
				'off'
			],
			'@stylistic/computed-property-spacing': [
				'off'
			],
			'@stylistic/member-delimiter-style': [
				'off'
			],
			'@stylistic/max-statements-per-line': [
				'off'
			],
			'@stylistic/no-tabs': [
				'off'
			],
			'@stylistic/operator-linebreak': [
				'off'
			]
		}
	},
	{
		files: [
			'**/*.tsx'
		],
		languageOptions: {
			parserOptions: {
				babelOptions: {
					parserOpts: {
						plugins: [
							'typescript',
							'jsx'
						]
					}
				}
			}
		}
	}
]);
