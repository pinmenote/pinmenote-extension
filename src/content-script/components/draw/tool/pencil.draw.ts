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
import { ObjPointDto } from '../../../../common/model/obj/obj-utils.dto';

export class PencilDraw {
  private static points: ObjPointDto[] = [];
  private static color: string;
  private static lineWidth: number;

  private static from: ObjPointDto;

  static startDraw(from: ObjPointDto, color: string, lineWidth: number, ctx: CanvasRenderingContext2D): void {
    this.points = [];
    this.from = from;
    this.color = color;
    this.lineWidth = lineWidth;
    this.draw(from, ctx);
  }

  static stopDraw(): ObjPointDto[] {
    return this.points;
  }

  static draw(to: ObjPointDto, ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.moveTo(this.from.x, this.from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'miter';
    ctx.stroke();
    ctx.closePath();
    this.from = to;
    this.points.push(to);
  }

  static raster(points: ObjPointDto[], color: string, lineWidth: number, ctx: CanvasRenderingContext2D): void {
    if (points.length === 0) return;
    const from = points[0];
    this.startDraw(from, color, lineWidth, ctx);
    for (let i = 1; i < points.length; i++) {
      this.draw(points[i], ctx);
    }
  }
}
