
export default {
  basePath: '/',
  allowedHosts: [
  "localhost",
  "127.0.0.1",
  "::1",
  "*.c24.airoapp.ai",
  "primrosetrustedcare.com",
  "*.primrosetrustedcare.com"
],
  supportedLocales: {
  "en-US": ""
},
  entryPoints: {
    '': () => import('./main.server.mjs')
  },
};
