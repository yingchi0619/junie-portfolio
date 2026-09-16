# Junie Portfolio

Responsive engineering, data and operations portfolio built with React, TypeScript, Vinext and Cloudflare Workers. Includes interactive delivery and capacity experiences, plus real project screenshots and links to live applications.

## Local development

Use Node.js 24 (see `.node-version`).

```sh
npm ci
npm run dev
```

## Cloudflare deployment

Connect `yingchi0619/junie-portfolio` in Cloudflare Workers & Pages:

- Worker name: `junie-portfolio`
- Production branch: `main`
- Root directory: `/`
- Build command: `npm run build`
- Deploy command: `npm run deploy`
- Node version: 24.19.0
- Cloudflare Access: off for the public portfolio

The build produces the Worker and static assets in `dist/`. Deployment uses the generated `dist/server/wrangler.json`. No application secrets or AI tokens are needed; MiniWeather runs separately on Render. GitHub pushes to main trigger deployment.

For manual deployment with an authorized Cloudflare account:

```sh
npx wrangler login
npm run build
npm run deploy
```

The historical `.openai/hosting.json` is retained only to identify the previous Sites publication. It is not used by this independent Cloudflare build.
