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
import { HtmlComputeParams, HtmlIntermediateData } from '../../model/html.model';
import { SegmentTypeDto } from '../../../common/model/obj/page-segment.dto';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { fnSha256 } from '../../../common/fn/fn-sha256';

type CtxName = '2d' | 'webgl' | 'webgl2';

const BIGNUM = 1_000_000;
const ONEPX = 'data:image/gif;base64,R0lGODlhAQABAHAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

const findContext = (ref: HTMLCanvasElement): { ctx: RenderingContext | null; name: CtxName } => {
  let name: CtxName = '2d';
  let ctx: RenderingContext | null = ref.getContext(name);
  if (!ctx) name = 'webgl';
  ctx = ref.getContext(name, { preserveDrawingBuffer: true });
  if (!ctx) name = 'webgl2';
  ctx = ref.getContext(name, { preserveDrawingBuffer: true });
  return { ctx, name };
};

export class HtmlCanvasFactory {
  static computeCanvas = (params: HtmlComputeParams): HtmlIntermediateData => {
    fnConsoleLog('HtmlFactory->computeCanvas');
    const ref = params.ref as HTMLCanvasElement;
    let imgData = '';
    const render = findContext(ref);

    if (render.ctx) {
      switch (render.name) {
        case '2d':
          imgData = ref.toDataURL('image/png', 80);
          break;
        case 'webgl':
        case 'webgl2': {
          const gl = render.ctx as WebGLRenderingContext;
          if (gl.getContextAttributes()?.preserveDrawingBuffer) {
            imgData = ref.toDataURL('image/png', 80);
            fnConsoleLog('HtmlFactory->computeCanvas->preserveDrawingBuffer', true);
          } else {
            fnConsoleLog('HtmlFactory->computeCanvas->preserveDrawingBuffer', false);
            imgData = ONEPX;
          }
        }
      }
    }

    let width = ref.getAttribute('width');
    let height = ref.getAttribute('height');

    const rect1 = ref.parentElement?.getBoundingClientRect();
    const rect2 = ref.getBoundingClientRect();
    width = Math.min(width ? parseInt(width) : BIGNUM, rect1?.width || BIGNUM, rect2.width).toString() || '100%';
    height = Math.min(height ? parseInt(height) : BIGNUM, rect1?.height || BIGNUM, rect2.height).toString() || '100%';

    const hash = fnSha256(imgData);

    let html = `<img data-pin-hash="${hash}" width="${width}" height="${height}" `;

    const style = ref.getAttribute('style') || '';
    if (style) html += `style="${style}" `;

    const clazz = ref.getAttribute('class') || '';
    if (clazz) html += `class="${clazz}" `;

    html += `/>`;

    params.contentCallback({
      hash,
      type: SegmentTypeDto.IMG,
      content: {
        src: imgData
      }
    });

    return {
      html,
      assets: [hash]
    };
  };
}
