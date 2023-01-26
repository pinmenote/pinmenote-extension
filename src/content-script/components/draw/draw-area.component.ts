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
import { DrawToolDto, ObjDrawDataDto } from '../../../common/model/obj-draw.model';
import { ObjPointDto, ObjRectangleDto } from '../../../common/model/obj-utils.model';
import { EraserDraw } from './tool/eraser.draw';
import { FillDraw } from './tool/fill.draw';
import { LineDraw } from './tool/line.draw';
import { PencilDraw } from './tool/pencil.draw';
import { PinComponent } from '../pin.component';
import { applyStylesToElement } from '../../../common/style.utils';

const canvasStyles = {
  position: 'absolute',
  top: '0px',
  left: '0px'
};

export class DrawAreaComponent {
  readonly rasterCanvas: HTMLCanvasElement = document.createElement('canvas');
  readonly drawCanvas: HTMLCanvasElement = document.createElement('canvas');
  private readonly drawCtx: CanvasRenderingContext2D | null;
  private readonly rasterCtx: CanvasRenderingContext2D | null;

  private tool = DrawToolDto.Pencil;
  private size = 4;
  private color = '#ff0000';

  private drawing = false;
  private drawData: ObjDrawDataDto[] = [];
  private drawRedoData: ObjDrawDataDto[] = [];

  constructor(private parent: PinComponent, private rect: ObjRectangleDto) {
    this.drawCanvas.width = rect.width;
    this.drawCanvas.height = rect.height;
    this.drawCanvas.style.width = `${rect.width}px`;
    this.drawCanvas.style.height = `${rect.height}px`;
    applyStylesToElement(this.drawCanvas, canvasStyles);
    this.drawCanvas.innerText = 'no javascript enabled - drawing not working';
    this.drawCtx = this.drawCanvas.getContext('2d');
    if (this.drawCtx) this.drawCtx.imageSmoothingEnabled = false;

    this.rasterCanvas.width = rect.width;
    this.rasterCanvas.height = rect.height;
    this.rasterCanvas.style.width = `${rect.width}px`;
    this.rasterCanvas.style.height = `${rect.height}px`;
    applyStylesToElement(this.rasterCanvas, canvasStyles);
    this.rasterCanvas.innerText = 'no javascript enabled - drawing not working';
    this.rasterCtx = this.rasterCanvas.getContext('2d');
    if (this.rasterCtx) this.rasterCtx.imageSmoothingEnabled = false;
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
      for (let i = 0; i < this.drawData.length; i++) {
        this.drawOne(this.drawData[i]);
      }
      return true;
    }
    return false;
  }

  redo(): boolean {
    const data = this.drawRedoData.pop();
    if (data) {
      this.drawData.push(data);
      this.drawOne(data);
      return true;
    }
    return false;
  }

  private drawOne(data: ObjDrawDataDto): void {
    if (!this.rasterCtx) return;
    if (data) {
      switch (data.tool) {
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
  }

  render(): void {
    this.drawCanvas.addEventListener('mousedown', this.handleMouseDown);
    this.drawCanvas.addEventListener('mouseup', this.handleMouseUp);
    this.drawCanvas.addEventListener('mouseout', this.handleMouseUp);
    this.drawCanvas.addEventListener('mousemove', this.handleMouseMove);
  }

  resize(rect: ObjRectangleDto): void {
    this.rect = rect;
    this.drawCanvas.width = rect.width;
    this.drawCanvas.height = rect.height;
    this.drawCanvas.style.width = `${rect.width}px`;
    this.drawCanvas.style.height = `${rect.height}px`;
    this.drawCtx?.drawImage(this.rasterCanvas, 0, 0);
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

    // we can undo
    this.parent.drawBar.undoSelect();

    // show back raster canvas
    this.rasterCanvas.style.display = 'inline-block';
    let points: ObjPointDto[] = [];
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
        points = EraserDraw.stopDraw(this.drawCtx);
        EraserDraw.raster(points, this.size, this.rasterCtx);
        break;
      case DrawToolDto.Fill:
        points = FillDraw.fill({ x: e.offsetX, y: e.offsetY }, this.color, this.drawCtx);
        FillDraw.raster(points, this.color, this.rasterCtx);
        break;
    }
    // clear draw canvas
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
        this.drawCtx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
        this.drawCtx.drawImage(this.rasterCanvas, 0, 0);
        LineDraw.draw({ x: e.offsetX, y: e.offsetY }, this.drawCtx);
        break;
      case DrawToolDto.Erase:
        EraserDraw.draw({ x: e.offsetX, y: e.offsetY }, this.drawCtx);
        break;
    }
  };

  private handleMouseDown = (e: MouseEvent) => {
    if (!this.drawCtx || !this.rasterCtx) return;
    this.drawing = true;
    // cleanup redo
    this.drawRedoData = [];
    this.parent.drawBar.redoUnselect();

    // set draw data from draw bar
    this.tool = this.parent.drawBar.tool();
    this.size = this.parent.drawBar.size();
    this.color = this.parent.drawBar.color();

    // draw from raster to draw and hide raster canvas
    this.drawCtx.drawImage(this.rasterCanvas, 0, 0);
    this.rasterCanvas.style.display = 'none';

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
