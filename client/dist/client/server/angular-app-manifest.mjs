
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 0,
    "preload": [
      "chunk-QZISPNFN.js",
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
    'index.csr.html': {size: 7470, hash: '6f13b8d09e48c5e81a14a10767f1f3a41fa9ea447d0cdfeac60bb84d4d58d37f', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 6466, hash: 'e8ef1e9daba0bda82156e387aac589970868b077d20e57f88baa7bf8f84e5e7c', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-D3YRN5IM.css': {size: 1883, hash: 'H1YTTF8An1s', text: () => import('./assets-chunks/styles-D3YRN5IM_css.mjs').then(m => m.default)}
  },
};
