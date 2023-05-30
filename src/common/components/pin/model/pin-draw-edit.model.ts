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
import { DrawToolDto, ObjDrawDataDto, ObjDrawDto, ObjDrawListDto } from '../../../model/obj/obj-draw.dto';
import { DrawAreaComponent } from '../draw/draw-area.component';
import { DrawRedoButton } from '../draw-bar/draw-buttons/draw-redo.button';
import { DrawUndoButton } from '../draw-bar/draw-buttons/draw-undo.button';
import { ObjSizeDto } from '../../../model/obj/obj-utils.dto';
import { PinAddDrawCommand } from '../../../command/pin/draw/pin-add-draw.command';
import { PinEditModel } from './pin-edit.model';
import { PinUpdateDrawCommand } from '../../../command/pin/draw/pin-update-draw.command';
import { fnDeepCopy } from '../../../fn/fn-copy';

export class DrawDataModel {
  private draw: ObjDrawListDto;
  private drawIndex: number;
  private currentDraw: ObjDrawDto;

  constructor(draw: ObjDrawListDto) {
    this.draw = draw;
    this.drawIndex = draw.data.length - 1;

    if (draw.data[this.drawIndex]) {
      this.currentDraw = draw.data[this.drawIndex];
      this.currentDraw.data = this.currentDraw.data.concat();
      this.currentDraw.size = fnDeepCopy(this.currentDraw.size);
    } else {
      this.currentDraw = DrawDataModel.emptyDraw(0, 0);
    }
  }

  hasData(): boolean {
    return this.draw.data.length > 0;
  }

  get currentData(): ObjDrawDataDto[] {
    return this.currentDraw.data;
  }

  get size(): ObjSizeDto {
    return this.currentDraw.size;
  }

  createDraw(width: number, height: number) {
    this.currentDraw = DrawDataModel.emptyDraw(width, height);
  }

  async saveDraw(model: PinEditModel) {
    if (this.currentDraw.hash === this.draw.data[this.drawIndex].hash) {
      await new PinUpdateDrawCommand(model.object, this.currentDraw).execute();
    } else {
      await new PinAddDrawCommand(model.object, this.currentDraw).execute();
    }
  }

  // Index
  hasNextIndex(): boolean {
    return this.drawIndex <= this.draw.data.length - 1;
  }

  hasPrevIndex(): boolean {
    return this.drawIndex > 0;
  }

  nextDraw() {
    if (this.hasNextIndex()) this.drawIndex++;
  }

  prevDraw() {
    if (this.hasPrevIndex()) this.drawIndex--;
  }

  removeDraw() {
    this.draw.data.splice(this.drawIndex, 1);
    this.drawIndex = Math.max(this.draw.data.length - 1, 0);
  }

  private static emptyDraw(width: number, height: number): ObjDrawDto {
    return {
      createdAt: Date.now(),
      updatedAt: Date.now(),
      data: [],
      size: { width, height },
      hash: ''
    };
  }
}

export class PinDrawEditModel {
  tool = DrawToolDto.Pencil;
  size = 4;
  color = '#ff0000';
  area?: DrawAreaComponent;

  private readonly drawData: DrawDataModel;

  private undoButton?: DrawUndoButton;
  private redoButton?: DrawRedoButton;

  constructor(draw: ObjDrawListDto) {
    this.drawData = new DrawDataModel(draw);
  }

  get data(): DrawDataModel {
    return this.drawData;
  }

  undoSelect() {
    this.undoButton?.select();
  }

  redoUnselect() {
    this.redoButton?.unselect();
  }

  setUndoButton(value: DrawUndoButton) {
    this.undoButton = value;
  }

  setRedoButton(value: DrawRedoButton) {
    this.redoButton = value;
  }

  setDrawArea(value: DrawAreaComponent) {
    this.area = value;
  }
}
