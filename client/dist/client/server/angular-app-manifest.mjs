
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 0,
    "preload": [
      "chunk-PTBIUXNV.js",
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
    'index.csr.html': {size: 7470, hash: '7ce8c32cafe01bce73a5c5987d4f92211a36769981e7ab05811e5d9f48d31810', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 6466, hash: '4198c7383776a559d1453f5bae0017a0b623cd5d5531f567c2a81e9feec894f9', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-D3YRN5IM.css': {size: 1883, hash: 'H1YTTF8An1s', text: () => import('./assets-chunks/styles-D3YRN5IM_css.mjs').then(m => m.default)}
  },
};
