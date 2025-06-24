# create-svelte

## After deployment

connect on scm
```bash
cd sites/wwwroot/
cp build/* ./ -r
```
If that doesn't work, rm -rf the wwwroot content and redeploy first.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Debugging server side

You can connect a dev tools to your node backend to debug server-side code:

```bash
node --inspect-brk node_modules/vite/bin/vite.js dev
```

Go in chrome or edge and browse 
edge://inspect

In the configure option, ensure that the url listed by the command above is set.
The running inspector should be visible in the list, inspect it to start the app with the dev tools open.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
