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

export class LineDraw {
  private static color: string;
  private static lineWidth: number;

  private static from: ObjPoint;
  private static to: ObjPoint;

  static startDraw(from: ObjPoint, color: string, lineWidth: number, ctx: CanvasRenderingContext2D): void {
    this.from = from;
    this.color = color;
    this.lineWidth = lineWidth;
    this.draw(from, ctx);
  }

  static stopDraw(): ObjPoint[] {
    return [this.from, this.to];
  }

  static draw(to: ObjPoint, ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.beginPath();
    ctx.moveTo(this.from.x, this.from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.lineWidth;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.closePath();
  }

  static raster(points: ObjPoint[], color: string, lineWidth: number, ctx: CanvasRenderingContext2D): void {
    this.startDraw(points[0], color, lineWidth, ctx);
    this.draw(points[1], ctx);
  }
}
