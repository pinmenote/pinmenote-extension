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
import { ContentTypeDto } from '../../../common/model/obj/obj-content.dto';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { fnSha256 } from '../../../common/fn/fn-sha256';

type CtxName = '2d' | 'webgl' | 'webgl2';

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
            /* TODO capture webgl texture without preserveDrawingBuffer
                        const texture = gl.createTexture();
                        gl.bindTexture(gl.TEXTURE_2D, texture);
                        const empty1x1 = new Uint8Array([1, 1, 1, 1]);
                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, empty1x1);
                        gl.framebufferTexture2D(
                            gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                            gl.TEXTURE_2D, texture, 0);
                        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) {

                        }*/
            const can = document.createElement('canvas');
            const empty1x1 = new Uint8Array([1, 1, 1, 1]);
            const img = new ImageData(Uint8ClampedArray.from(empty1x1), 1, 1);
            const ctx = can.getContext('2d');
            if (ctx) {
              ctx.putImageData(img, 0, 0);
            }
            imgData = can.toDataURL('image/png', 80);
          }
        }
      }
    }

    let width = ref.getAttribute('width');
    let height = ref.getAttribute('height');

    if (!width || !height) {
      const rect1 = ref.parentElement?.getBoundingClientRect();
      const rect2 = ref.getBoundingClientRect();
      width = Math.max(rect1?.width || 0, rect2.width).toString() || '100%';
      height = Math.max(rect1?.height || 0, rect2.height).toString() || '100%';
    }

    const hash = fnSha256(imgData);

    let html = `<img data-pin-hash="${hash}" width="${width}" height="${height}" `;

    const style = ref.getAttribute('style') || '';
    if (style) html += `style="${style}" `;

    const clazz = ref.getAttribute('class') || '';
    if (clazz) html += `class="${clazz}" `;

    html += `/>`;

    params.contentCallback({
      hash,
      type: ContentTypeDto.IMG,
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
