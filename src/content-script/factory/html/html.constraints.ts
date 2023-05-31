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

export interface HtmlSkipAttribute {
  key: string;
  value: string;
}

export class HtmlConstraints {
  static readonly KNOWN_ELEMENTS = [
    'a',
    'abbr',
    'acronym',
    'address',
    'applet',
    'area',
    'article',
    'aside',
    'audio',
    'a',
    'b',
    'base',
    'basefont',
    'bdo',
    'big',
    'blockquote',
    'body',
    'br',
    'button',
    'canvas',
    'caption',
    'center',
    'cite',
    'code',
    'col',
    'colgroup',
    'datalist',
    'dd',
    'del',
    'dfn',
    'div',
    'dl',
    'dt',
    'em',
    'embed',
    'fieldset',
    'figcaption',
    'figure',
    'font',
    'footer',
    'form',
    'frame',
    'frameset',
    'header',
    'head',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'html',
    'i',
    'iframe',
    'img',
    'input',
    'ins',
    'kbd',
    'label',
    'legend',
    'li',
    'link',
    'main',
    'map',
    'mark',
    'meta',
    'meter',
    'nav',
    'noscript',
    'object',
    'ol',
    'optgroup',
    'option',
    'p',
    'param',
    'picture',
    'pre',
    'progress',
    'q',
    's',
    'samp',
    'script',
    'select',
    'small',
    'source',
    'span',
    'strike',
    'strong',
    'style',
    'sub',
    'sup',
    'table',
    'tbody',
    'td',
    'textarea',
    'tfoot',
    'th',
    'thead',
    'time',
    'title',
    'tr',
    'u',
    'ul',
    'var',
    'video',
    'wbr',
    // SVG - not in HTML
    'svg',
    'animate',
    'animatemotion',
    'animatetransform',
    'circle',
    'clippath',
    'defs',
    'desc',
    'discard',
    'ellipse',
    'feblend',
    'fecolormatrix',
    'fecomponenttransfer',
    'fecomposite',
    'feconvolvematrix',
    'fediffuselighting',
    'fedisplacementmap',
    'fedistantlight',
    'fedropshadow',
    'feflood',
    'fefunca',
    'fefuncb',
    'fefuncg',
    'fefuncr',
    'fegaussianblur',
    'feimage',
    'femerge',
    'femergenode',
    'femorphology',
    'feoffset',
    'fepointlight',
    'fespecularlighting',
    'fespotlight',
    'fetile',
    'feturbulence',
    'filter',
    'foreignobject',
    'g',
    'hatch',
    'hatchpath',
    'image',
    'line',
    'lineargradient',
    'marker',
    'mask',
    'metadata',
    'mpath',
    'path',
    'pattern',
    'polygon',
    'polyline',
    'radialgradient',
    'rect',
    'set',
    'stop',
    'switch',
    'symbol',
    'text',
    'textpath',
    'tspan',
    'use',
    'view'
  ];
  // keep this in constraints for now
  /* eslint-disable max-len */
  static YOUTUBE_SKIP: HtmlSkipAttribute[] = [
    {
      key: 'class',
      value: 'ytp-suggested-action-badge-expanded-content-container'
    },
    {
      key: 'class',
      value:
        'ytp-button ytp-suggested-action-badge ytp-suggested-action-badge-with-controls ytp-suggested-action-badge-expanded'
    },
    {
      key: 'class',
      value: 'ytp-featured-product-container'
    }
  ];
  static SKIP_URLS: { [key: string]: HtmlSkipAttribute[] } = {
    'www.youtube.com': this.YOUTUBE_SKIP,
    'youtube.com': this.YOUTUBE_SKIP
  };
}
