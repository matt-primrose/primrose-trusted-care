
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 0,
    "preload": [
      "chunk-HUP3T7BR.js",
      "chunk-EJNFCSHP.js",
      "chunk-V42MAQD7.js"
    ],
    "route": "/"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-APAJVUFL.js",
      "chunk-EJNFCSHP.js",
      "chunk-V42MAQD7.js"
    ],
    "route": "/services"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-CDRDF4PA.js",
      "chunk-V42MAQD7.js"
    ],
    "route": "/services/*"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-ZQPWPDUD.js",
      "chunk-V42MAQD7.js"
    ],
    "route": "/about"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-STXMR2OF.js",
      "chunk-EJNFCSHP.js",
      "chunk-V42MAQD7.js"
    ],
    "route": "/testimonials"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-EQWNGCSK.js",
      "chunk-3LINHFG2.js",
      "chunk-V42MAQD7.js"
    ],
    "route": "/contact"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-54GHEQ3S.js",
      "chunk-3LINHFG2.js",
      "chunk-V42MAQD7.js"
    ],
    "route": "/become-a-provider"
  },
  {
    "renderMode": 0,
    "redirectTo": "/",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 7470, hash: '78e92b6a5a61398e24a9c11cc63a6d5f5358503cd829924f73056d1e674080e4', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 6466, hash: '4f61c378ed59ad06edb5c07ec4fa64a288ae551eb71796872e566494530755f0', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-D3YRN5IM.css': {size: 1883, hash: 'H1YTTF8An1s', text: () => import('./assets-chunks/styles-D3YRN5IM_css.mjs').then(m => m.default)}
  },
};
