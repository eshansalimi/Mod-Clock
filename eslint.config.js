import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	prettierConfig,
	{
		ignores: ['node_modules/', 'dist/', 'test.js', 'Public/']
	},
	{
		languageOptions: {
			parserOptions: {
				"project": "tsconfig.json"
			}
		}
	},
	{
		rules: {
			"no-await-in-loop": 2,
			"no-duplicate-imports": 2,
			"no-template-curly-in-string": 2,
			"no-unreachable-loop": 2,
			"camelcase": 1,
			"capitalized-comments": 1
		}
	}
);