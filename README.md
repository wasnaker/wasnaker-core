# @wasnaker/core-web

Reusable UI components for Wasnaker ecosystem.

## Structure

```
packages/core/
├── web/                   # @wasnaker/core-web (React components)
│   ├── src/
│   ├── dist/              # Build output (gitignored)
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Development

```bash
# Build
cd packages/core/web
npm run build

# Watch mode
npm run watch

# Test
npm run test
```

## Publishing

```bash
# Set GitHub token
export GITHUB_TOKEN=ghp_xxxx

# Publish to GitHub Packages
cd packages/core/web
npm publish --registry=https://npm.github.io
```

## Dependencies

| Package | Version | Used By |
|---------|---------|---------|
| @wasnaker/region-web | 0.1.0 | Region module |
| @wasnaker/region-contract | 0.1.0 | Region module |

## Versioning

Independent versioning per package. Bump with:
```bash
npm version patch  # 0.1.0 -> 0.1.1
npm version minor  # 0.1.0 -> 0.2.0
npm version major  # 0.1.0 -> 1.0.0
```