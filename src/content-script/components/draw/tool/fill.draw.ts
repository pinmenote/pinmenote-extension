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
import { ObjPoint } from '../../../../common/model/obj-utils.model';

export class FillDraw {
  static fill(from: ObjPoint, color: string, ctx: CanvasRenderingContext2D): ObjPoint[] {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const pixelData = ctx.getImageData(0, 0, width, height).data;

    const index = (from.y * ctx.canvas.width + from.x) * 4;
    const newColor = ColorUtils.numberToRgb(ColorUtils.stringToNumber(color));

    const data = this.floodFill(
      pixelData,
      from.x,
      from.y,
      width,
      height,
      { r: pixelData[index], g: pixelData[index + 1], b: pixelData[index + 2] },
      newColor
    );

    const imData = new ImageData(data, width, height);
    ctx.putImageData(imData, 0, 0);

    return [from];
  }

  static raster(points: ObjPoint[], color: string, ctx: CanvasRenderingContext2D): void {
    this.fill(points[0], color, ctx);
  }

  private static floodFill(
    data: Uint8ClampedArray,
    x: number,
    y: number,
    width: number,
    height: number,
    prevColor: RGBColor,
    newColor: RGBColor
  ): Uint8ClampedArray {
    if (x >= width || y >= height || x < 0 || y < 0) return data;
    const index = (y * width + x) * 4;
    if (data[index] !== prevColor.r || data[index + 1] !== prevColor.g || data[index + 2] !== prevColor.b) {
      return data;
    }
    data[index] = newColor.r;
    data[index + 1] = newColor.g;
    data[index + 2] = newColor.b;
    data[index + 3] = 255;
    this.floodFill(data, x + 1, y, width, height, prevColor, newColor);
    this.floodFill(data, x - 1, y, width, height, prevColor, newColor);
    this.floodFill(data, x, y + 1, width, height, prevColor, newColor);
    this.floodFill(data, x, y - 1, width, height, prevColor, newColor);
    return data;
  }
}
