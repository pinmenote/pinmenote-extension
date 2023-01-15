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
import { ObjPoint } from '../../../../common/model/obj-utils.model';
import { fnConsoleLog } from '../../../../common/fn/console.fn';

export class FillDraw {
  static fill(from: ObjPoint, color: string, ctx: CanvasRenderingContext2D): ObjPoint[] {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(from.x, from.y);
    ctx.stroke();
    ctx.closePath();
    return [];
  }

  static raster(points: ObjPoint[], color: string, ctx: CanvasRenderingContext2D): void {
    fnConsoleLog('Raster fill');
  }
}
