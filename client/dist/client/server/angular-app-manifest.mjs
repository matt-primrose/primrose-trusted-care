
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 0,
    "preload": [
      "chunk-KLF6ZDP6.js",
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
    'index.csr.html': {size: 7470, hash: '63c76e52a8e26f2a68b6e2484588695ccabe38de360e2b87a74927c50c44cdf9', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 6466, hash: '7f0d5a0e6b50deeca25b2e9d045a1cd8a42011b4d1d0b9c0a135e22e91badcf5', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-D3YRN5IM.css': {size: 1883, hash: 'H1YTTF8An1s', text: () => import('./assets-chunks/styles-D3YRN5IM_css.mjs').then(m => m.default)}
  },
};
