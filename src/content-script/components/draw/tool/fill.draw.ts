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
import { ColorUtils, RGBColor } from '../../draw-bar/draw-buttons/draw-color.utils';
import { ObjPointDto } from '../../../../common/model/obj-utils.model';

export class FillDraw {
  static fill(from: ObjPointDto, color: string, ctx: CanvasRenderingContext2D): ObjPointDto[] {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const pixelData = ctx.getImageData(0, 0, width, height).data;

    const index = (from.y * ctx.canvas.width + from.x) * 4;
    const newColor = ColorUtils.stringToRgb(color);
    const prevColor = { r: pixelData[index], g: pixelData[index + 1], b: pixelData[index + 2] };
    if (newColor.r === prevColor.r && newColor.g === prevColor.g && newColor.b === prevColor.b) return [from];

    const stack: ObjPointDto[] = [];
    stack.push(from);
    while (stack.length > 0) {
      const point = stack.pop();
      if (!point) break;
      const x1 = this.canFill(pixelData, point.x + 1, point.y, width, height, prevColor);
      const x2 = this.canFill(pixelData, point.x - 1, point.y, width, height, prevColor);
      const y1 = this.canFill(pixelData, point.x, point.y + 1, width, height, prevColor);
      const y2 = this.canFill(pixelData, point.x, point.y - 1, width, height, prevColor);
      if (x1 >= 0) {
        pixelData[x1] = newColor.r;
        pixelData[x1 + 1] = newColor.g;
        pixelData[x1 + 2] = newColor.b;
        pixelData[x1 + 3] = 255;
        stack.push({ x: point.x + 1, y: point.y });
      }
      if (x2 >= 0) {
        pixelData[x2] = newColor.r;
        pixelData[x2 + 1] = newColor.g;
        pixelData[x2 + 2] = newColor.b;
        pixelData[x2 + 3] = 255;
        stack.push({ x: point.x - 1, y: point.y });
      }
      if (y1 >= 0) {
        pixelData[y1] = newColor.r;
        pixelData[y1 + 1] = newColor.g;
        pixelData[y1 + 2] = newColor.b;
        pixelData[y1 + 3] = 255;
        stack.push({ x: point.x, y: point.y + 1 });
      }
      if (y2 >= 0) {
        pixelData[y2] = newColor.r;
        pixelData[y2 + 1] = newColor.g;
        pixelData[y2 + 2] = newColor.b;
        pixelData[y2 + 3] = 255;
        stack.push({ x: point.x, y: point.y - 1 });
      }
    }

    const imData = new ImageData(pixelData, width, height);
    ctx.putImageData(imData, 0, 0);

    return [from];
  }

  private static canFill(
    data: Uint8ClampedArray,
    x: number,
    y: number,
    width: number,
    height: number,
    prevColor: RGBColor
  ): number {
    if (x >= width || y >= height || x < 0 || y < 0) return -1;
    const index = (y * width + x) * 4;
    if (data[index] !== prevColor.r || data[index + 1] !== prevColor.g || data[index + 2] !== prevColor.b) {
      return -1;
    }
    return index;
  }

  static raster(points: ObjPointDto[], color: string, ctx: CanvasRenderingContext2D): void {
    this.fill(points[0], color, ctx);
  }
}
