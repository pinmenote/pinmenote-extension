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
import { DrawToolDto, ObjDrawDto } from '../../../common/model/obj-draw.model';
import { EraserDraw } from './tool/eraser.draw';
import { FillDraw } from './tool/fill.draw';
import { LineDraw } from './tool/line.draw';
import { ObjPoint } from '../../../common/model/obj-utils.model';
import { PencilDraw } from './tool/pencil.draw';
import { PinComponent } from '../pin.component';
import { applyStylesToElement } from '../../../common/style.utils';
import PinRectangle = Pinmenote.Pin.PinRectangle;

const canvasStyles = {
  position: 'absolute',
  top: '0px',
  left: '0px'
};

export class DrawComponent {
  readonly rasterCanvas: HTMLCanvasElement = document.createElement('canvas');
  readonly drawCanvas: HTMLCanvasElement = document.createElement('canvas');
  private readonly drawCtx: CanvasRenderingContext2D | null;
  private readonly rasterCtx: CanvasRenderingContext2D | null;

  private tool = DrawToolDto.Pencil;
  private size = 4;
  private color = '#ff0000';

  private drawing = false;
  private drawData: ObjDrawDto[] = [];
  private drawRedoData: ObjDrawDto[] = [];

  constructor(private rect: PinRectangle, private parent: PinComponent) {
    this.drawCanvas.width = rect.width;
    this.drawCanvas.height = rect.height;
    this.drawCanvas.style.width = `${rect.width}px`;
    this.drawCanvas.style.height = `${rect.height}px`;
    applyStylesToElement(this.drawCanvas, canvasStyles);
    this.drawCanvas.innerText = 'no javascript enabled - drawing not working';
    this.drawCtx = this.drawCanvas.getContext('2d');

    this.rasterCanvas.width = rect.width;
    this.rasterCanvas.height = rect.height;
    this.rasterCanvas.style.width = `${rect.width}px`;
    this.rasterCanvas.style.height = `${rect.height}px`;
    applyStylesToElement(this.rasterCanvas, canvasStyles);
    this.rasterCanvas.innerText = 'no javascript enabled - drawing not working';
    this.rasterCtx = this.rasterCanvas.getContext('2d');
  }

  canUndo(): boolean {
    return this.drawData.length > 0;
  }

  canRedo(): boolean {
    return this.drawRedoData.length > 0;
  }

  undo(): boolean {
    if (!this.rasterCtx) return false;
    const data = this.drawData.pop();
    if (data) {
      this.drawRedoData.push(data);
      this.rasterCtx.clearRect(0, 0, this.rasterCanvas.width, this.rasterCanvas.height);
      // TODO redraw
      return true;
    }
    return false;
  }

  redo(): boolean {
    if (!this.rasterCtx) return false;
    const data = this.drawRedoData.pop();
    if (data) {
      this.drawData.push(data);
      switch (this.tool) {
        case DrawToolDto.Pencil:
          PencilDraw.raster(data.points, data.color, data.size, this.rasterCtx);
          break;
        case DrawToolDto.Line:
          LineDraw.raster(data.points, data.color, data.size, this.rasterCtx);
          break;
        case DrawToolDto.Erase:
          EraserDraw.raster(data.points, data.size, this.rasterCtx);
          break;
        case DrawToolDto.Fill:
          FillDraw.raster(data.points, data.color, this.rasterCtx);
          break;
      }
    }
    return false;
  }

  render(): void {
    this.drawCanvas.addEventListener('mousedown', this.handleMouseDown);
    this.drawCanvas.addEventListener('mouseup', this.handleMouseUp);
    this.drawCanvas.addEventListener('mouseout', this.handleMouseUp);
    this.drawCanvas.addEventListener('mousemove', this.handleMouseMove);
  }

  resize(rect: PinRectangle): void {
    this.rect = rect;
    this.drawCanvas.width = rect.width;
    this.drawCanvas.height = rect.height;
    this.drawCanvas.style.width = `${rect.width}px`;
    this.drawCanvas.style.height = `${rect.height}px`;
    this.rasterCanvas.width = rect.width;
    this.rasterCanvas.height = rect.height;
    this.rasterCanvas.style.width = `${rect.width}px`;
    this.rasterCanvas.style.height = `${rect.height}px`;
  }

  cleanup(): void {
    this.drawCanvas.removeEventListener('mousedown', this.handleMouseDown);
    this.drawCanvas.removeEventListener('mouseup', this.handleMouseUp);
    this.drawCanvas.removeEventListener('mouseout', this.handleMouseUp);
    this.drawCanvas.removeEventListener('mousemove', this.handleMouseMove);
  }

  private handleMouseUp = (e: MouseEvent) => {
    if (!this.drawing) return;
    if (!this.drawCtx || !this.rasterCtx) return;
    this.drawing = false;
    let points: ObjPoint[] = [];
    switch (this.tool) {
      case DrawToolDto.Pencil:
        points = PencilDraw.stopDraw();
        PencilDraw.raster(points, this.color, this.size, this.rasterCtx);
        break;
      case DrawToolDto.Line:
        points = LineDraw.stopDraw();
        LineDraw.raster(points, this.color, this.size, this.rasterCtx);
        break;
      case DrawToolDto.Erase:
        points = EraserDraw.stopDraw();
        EraserDraw.raster(points, this.size, this.rasterCtx);
        break;
      case DrawToolDto.Fill:
        points = FillDraw.fill({ x: e.offsetX, y: e.offsetY }, this.color, this.drawCtx);
        FillDraw.raster(points, this.color, this.rasterCtx);
        break;
    }
    this.drawCtx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
    this.drawData.push({
      tool: this.tool,
      size: this.size,
      color: this.color,
      points
    });
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.drawCtx || !this.drawing) return;
    switch (this.tool) {
      case DrawToolDto.Pencil:
        PencilDraw.draw({ x: e.offsetX, y: e.offsetY }, this.drawCtx);
        break;
      case DrawToolDto.Line:
        LineDraw.draw({ x: e.offsetX, y: e.offsetY }, this.drawCtx);
        break;
      case DrawToolDto.Erase:
        EraserDraw.draw({ x: e.offsetX, y: e.offsetY }, this.drawCtx);
        break;
    }
  };

  private handleMouseDown = (e: MouseEvent) => {
    if (!this.drawCtx) return;
    this.drawing = true;
    this.tool = this.parent.drawBar.tool();
    this.size = this.parent.drawBar.size();
    this.color = this.parent.drawBar.color();
    switch (this.tool) {
      case DrawToolDto.Pencil:
        PencilDraw.startDraw({ x: e.offsetX, y: e.offsetY }, this.color, this.size, this.drawCtx);
        break;
      case DrawToolDto.Line:
        LineDraw.startDraw({ x: e.offsetX, y: e.offsetY }, this.color, this.size, this.drawCtx);
        break;
      case DrawToolDto.Erase:
        EraserDraw.startDraw({ x: e.offsetX, y: e.offsetY }, this.size, this.drawCtx);
        break;
    }
  };
}
