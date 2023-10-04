/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2023 Michal Szczepanski.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React, { FunctionComponent } from 'react';
import Link from '@mui/material/Link';
import {
  LICENSE_APACHE_20,
  LICENSE_DAYJS,
  LICENSE_FASTEST_LEVENSTEIN,
  LICENSE_FONTSOURCE,
  LICENSE_HTML_PRETTIFY,
  LICENSE_JS_SHA256,
  LICENSE_JWT_DECODE,
  LICENSE_MARKED,
  LICENSE_MIT,
  LICENSE_MUI,
  LICENSE_MUI_X_DATEPICKERS,
  LICENSE_NANOID,
  LICENSE_NOBLE_CIPHERS,
  LICENSE_NOBLE_HASHES_CURVES,
  LICENSE_NODE_LANGUAGE_DETECT,
  LICENSE_PAKO,
  LICENSE_PARSE5,
  LICENSE_PINMENOTE_MIT,
  LICENSE_PROSEMIRROR,
  LICENSE_REACT,
  LICENSE_REMOVE_MARKDOWN
} from './opensource-license-text';

interface OpensourceElement {
  title: string;
  license: string;
  licenseHeader?: string;
  url: string;
}

const ELEMENTS: OpensourceElement[] = [
  {
    title: 'Fontsource Roboto',
    licenseHeader: LICENSE_FONTSOURCE,
    license: LICENSE_MIT,
    url: 'https://fontsource.org'
  },
  {
    title: 'Material Icons',
    licenseHeader: LICENSE_MUI,
    license: LICENSE_MIT,
    url: 'https://mui.com/material-ui/material-icons/'
  },
  {
    title: 'Material UI',
    licenseHeader: LICENSE_MUI,
    license: LICENSE_MIT,
    url: 'https://mui.com/material-ui/'
  },
  {
    title: '@mui/x-date-pickers',
    licenseHeader: LICENSE_MUI_X_DATEPICKERS,
    license: LICENSE_MIT,
    url: 'https://mui.com/x/react-date-pickers/'
  },
  {
    title: 'noble-ciphers',
    licenseHeader: LICENSE_NOBLE_CIPHERS,
    license: LICENSE_MIT,
    url: 'https://paulmillr.com/noble/'
  },
  {
    title: 'noble-curves',
    licenseHeader: LICENSE_NOBLE_HASHES_CURVES,
    license: LICENSE_MIT,
    url: 'https://paulmillr.com/noble/'
  },
  {
    title: 'noble-hashes',
    licenseHeader: LICENSE_NOBLE_HASHES_CURVES,
    license: LICENSE_MIT,
    url: 'https://paulmillr.com/noble/'
  },
  {
    title: 'browser-api',
    licenseHeader: LICENSE_PINMENOTE_MIT,
    license: LICENSE_MIT,
    url: 'https://github.com/pinmenote/browser-api'
  },
  {
    title: 'fetch-service',
    licenseHeader: LICENSE_PINMENOTE_MIT,
    license: LICENSE_MIT,
    url: 'https://github.com/pinmenote/fetch-service'
  },
  {
    title: 'tiny-dispatcher',
    licenseHeader: LICENSE_PINMENOTE_MIT,
    license: LICENSE_MIT,
    url: 'https://github.com/pinmenote/tiny-dispatcher'
  },
  {
    title: 'day.js',
    licenseHeader: LICENSE_DAYJS,
    license: LICENSE_MIT,
    url: 'https://day.js.org/'
  },
  {
    title: 'fastest-levenshtein',
    licenseHeader: LICENSE_FASTEST_LEVENSTEIN,
    license: LICENSE_MIT,
    url: 'https://github.com/ka-weihe/fastest-levenshtein'
  },
  {
    title: 'HTML Prettify',
    licenseHeader: LICENSE_HTML_PRETTIFY,
    license: LICENSE_MIT,
    url: 'https://github.com/Dmc0125/html-prettify'
  },
  {
    title: 'js-sha256',
    licenseHeader: LICENSE_JS_SHA256,
    license: LICENSE_MIT,
    url: 'https://github.com/emn178/js-sha256'
  },
  {
    title: 'jwt-decode',
    licenseHeader: LICENSE_JWT_DECODE,
    license: LICENSE_MIT,
    url: 'https://github.com/auth0/jwt-decode'
  },
  {
    title: 'Node Language Detect',
    licenseHeader: LICENSE_NODE_LANGUAGE_DETECT,
    license: LICENSE_MIT,
    url: 'https://github.com/FGRibreau/node-language-detect'
  },
  {
    title: 'Marked',
    licenseHeader: LICENSE_MARKED,
    license: LICENSE_MIT,
    url: 'https://marked.js.org/'
  },
  {
    title: 'Nano ID',
    licenseHeader: LICENSE_NANOID,
    license: LICENSE_MIT,
    url: 'https://github.com/ai/nanoid'
  },
  {
    title: 'pako',
    licenseHeader: LICENSE_PAKO,
    license: LICENSE_MIT,
    url: 'https://github.com/nodeca/pako'
  },
  {
    title: 'parse5',
    licenseHeader: LICENSE_PARSE5,
    license: LICENSE_MIT,
    url: 'https://github.com/inikulin/parse5'
  },
  {
    title: 'pdfjs-dist',
    license: LICENSE_APACHE_20,
    url: 'http://mozilla.github.io/pdf.js/'
  },
  {
    title: 'prosemirror-commands',
    licenseHeader: LICENSE_PROSEMIRROR,
    license: LICENSE_MIT,
    url: 'http://prosemirror.net/'
  },
  {
    title: 'prosemirror-dropcursor',
    licenseHeader: LICENSE_PROSEMIRROR,
    license: LICENSE_MIT,
    url: 'http://prosemirror.net/'
  },
  {
    title: 'prosemirror-gapcursor',
    licenseHeader: LICENSE_PROSEMIRROR,
    license: LICENSE_MIT,
    url: 'http://prosemirror.net/'
  },
  {
    title: 'prosemirror-history',
    licenseHeader: LICENSE_PROSEMIRROR,
    license: LICENSE_MIT,
    url: 'http://prosemirror.net/'
  },
  {
    title: 'prosemirror-inputrules',
    licenseHeader: LICENSE_PROSEMIRROR,
    license: LICENSE_MIT,
    url: 'http://prosemirror.net/'
  },
  {
    title: 'prosemirror-markdown',
    licenseHeader: LICENSE_PROSEMIRROR,
    license: LICENSE_MIT,
    url: 'http://prosemirror.net/'
  },
  {
    title: 'prosemirror-model',
    licenseHeader: LICENSE_PROSEMIRROR,
    license: LICENSE_MIT,
    url: 'http://prosemirror.net/'
  },
  {
    title: 'prosemirror-schema-basic',
    licenseHeader: LICENSE_PROSEMIRROR,
    license: LICENSE_MIT,
    url: 'http://prosemirror.net/'
  },
  {
    title: 'prosemirror-schema-list',
    licenseHeader: LICENSE_PROSEMIRROR,
    license: LICENSE_MIT,
    url: 'http://prosemirror.net/'
  },
  {
    title: 'prosemirror-state',
    licenseHeader: LICENSE_PROSEMIRROR,
    license: LICENSE_MIT,
    url: 'http://prosemirror.net/'
  },
  {
    title: 'prosemirror-view',
    licenseHeader: LICENSE_PROSEMIRROR,
    license: LICENSE_MIT,
    url: 'http://prosemirror.net/'
  },
  {
    title: 'react',
    licenseHeader: LICENSE_REACT,
    license: LICENSE_MIT,
    url: 'https://reactjs.org/'
  },
  {
    title: 'react-dom',
    licenseHeader: LICENSE_REACT,
    license: LICENSE_MIT,
    url: 'https://reactjs.org/'
  },
  {
    title: 'remove-markdown',
    licenseHeader: LICENSE_REMOVE_MARKDOWN,
    license: LICENSE_MIT,
    url: 'https://github.com/stiang/remove-markdown'
  }
];

export const OpenSourceListComponent: FunctionComponent = () => {
  const components = [];
  for (let i = 0; i < ELEMENTS.length; i++) {
    const el = ELEMENTS[i];
    components.push(
      <div key={`os-el-${i}`} style={{ padding: 10, margin: 10, border: '1px solid #eee' }}>
        <h2>{el.title}</h2>
        <h3>
          <Link href={el.url} target="_blank">
            {el.url}
          </Link>
        </h3>
        <pre style={{ textWrap: 'wrap' }}>{el.licenseHeader || ''}</pre>
        <pre style={{ textWrap: 'wrap' }}>{el.license}</pre>
      </div>
    );
  }
  return (
    <div>
      <h1>opensource licenses</h1>
      {components}
    </div>
  );
};
