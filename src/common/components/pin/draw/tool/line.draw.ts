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
import { ObjPointDto } from '../../../../model/obj/obj-utils.dto';

export class LineDraw {
  private static color: string;
  private static lineWidth: number;

  private static from: ObjPointDto;
  private static to: ObjPointDto;

  static startDraw(from: ObjPointDto, color: string, lineWidth: number, ctx: CanvasRenderingContext2D): void {
    this.from = from;
    this.color = color;
    this.lineWidth = lineWidth;
    this.draw(from, ctx);
  }

  static stopDraw(): ObjPointDto[] {
    return [this.from, this.to];
  }

  static draw(to: ObjPointDto, ctx: CanvasRenderingContext2D): void {
    this.to = to;
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

  static raster(points: ObjPointDto[], color: string, lineWidth: number, ctx: CanvasRenderingContext2D): void {
    this.startDraw(points[0], color, lineWidth, ctx);
    this.draw(points[1], ctx);
  }
}
