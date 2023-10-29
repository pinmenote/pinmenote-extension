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
import { BrowserStorage } from '@pinmenote/browser-api';
import { ObjectStoreKeys } from '../../../keys/object.store.keys';

export class DrawDataModel {
  private draw: ObjDrawListDto;
  private drawIndex: number;
  private currentDrawHash?: string;
  private drawData?: ObjDrawDto;

  constructor(draw: ObjDrawListDto) {
    this.draw = draw;
    this.drawIndex = draw.data.length - 1;
    this.currentDrawHash = draw.data[this.drawIndex];
  }

  loadDraw = async () => {
    if (this.currentDrawHash) {
      this.drawData = await BrowserStorage.get<ObjDrawDto>(`${ObjectStoreKeys.PIN_DRAW}:${this.currentDrawHash}`);
      this.drawData.data = this.drawData.data.concat();
      this.drawData.size = fnDeepCopy(this.drawData.size);
    }
  };

  hasData(): boolean {
    return this.draw.data.length > 0;
  }

  get currentData(): ObjDrawDataDto[] {
    return this.drawData?.data || [];
  }

  get size(): ObjSizeDto {
    return this.drawData?.size || { width: 0, height: 0 };
  }

  createDraw(width: number, height: number) {
    this.drawData = DrawDataModel.emptyDraw(width, height);
    this.currentDrawHash = undefined;
  }

  async saveDraw(model: PinEditModel) {
    if (!this.drawData) return;
    if (this.currentDrawHash) {
      await new PinUpdateDrawCommand(model.object, this.drawData, this.currentDrawHash).execute();
    } else {
      await new PinAddDrawCommand(model.object, this.drawData).execute();
    }
  }

  async removeDraw(model: PinEditModel) {
    this.draw.data.splice(this.drawIndex, 1);
    model.object.data.draw.data = this.draw.data.concat();
    await BrowserStorage.set(`${ObjectStoreKeys.OBJECT_ID}:${model.object.id}`, model.object);
    if (this.drawData) await BrowserStorage.remove(`${ObjectStoreKeys.PIN_DRAW}:${this.drawData.hash}`);
    this.reset();
  }

  reset() {
    this.drawData = undefined;
    this.drawIndex = this.draw.data.length - 1;
    this.currentDrawHash = this.draw.data[this.drawIndex];
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
