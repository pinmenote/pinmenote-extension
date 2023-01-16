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
import { HtmlComponent, HtmlComponentFocusable } from '../../../common/model/html.model';
import { DrawBrushSizeComponent } from './draw-buttons/draw-brush-size.component';
import { DrawColorPickerComponent } from './draw-buttons/draw-color-picker.component';
import { DrawEraseComponent } from './draw-buttons/draw-erase.component';
import { DrawFillComponent } from './draw-buttons/draw-fill.component';
import { DrawLineComponent } from './draw-buttons/draw-line.component';
import { DrawPencilComponent } from './draw-buttons/draw-pencil.component';
import { DrawRedoComponent } from './draw-buttons/draw-redo.component';
import { DrawToolDto } from '../../../common/model/obj-draw.model';
import { DrawUndoComponent } from './draw-buttons/draw-undo.component';
import { PinComponent } from '../pin.component';
import { applyStylesToElement } from '../../../common/style.utils';
import PinRectangle = Pinmenote.Pin.PinRectangle;

const drawBarStyles = {
  top: '-24px',
  height: '24px',
  position: 'absolute',
  'background-color': '#ffffff',
  display: 'none'
};

const iconStyles = {
  left: `0px`,
  position: 'absolute',
  'background-color': '#ffffff00'
};

export class DrawBarComponent implements HtmlComponent<HTMLElement>, HtmlComponentFocusable {
  private readonly el = document.createElement('div');

  private visible = false;
  private toolValue: DrawToolDto = DrawToolDto.Pencil;

  private readonly pencil: DrawPencilComponent;
  private readonly line: DrawLineComponent;
  private readonly fill: DrawFillComponent;
  private readonly erase: DrawEraseComponent;

  private readonly colorPicker: DrawColorPickerComponent;
  private readonly sizeButton: DrawBrushSizeComponent;

  private readonly undoButton: DrawUndoComponent;
  private readonly redoButton: DrawRedoComponent;

  constructor(private rect: PinRectangle, private parent: PinComponent) {
    this.pencil = new DrawPencilComponent(this);
    this.line = new DrawLineComponent(this);
    this.fill = new DrawFillComponent(this);
    this.erase = new DrawEraseComponent(this);

    this.colorPicker = new DrawColorPickerComponent(rect, parent);
    this.sizeButton = new DrawBrushSizeComponent(parent);

    this.undoButton = new DrawUndoComponent(this);
    this.redoButton = new DrawRedoComponent(this);
  }

  setTool(tool: DrawToolDto): void {
    switch (tool) {
      case DrawToolDto.Pencil:
        this.pencil.select();
        this.line.unselect();
        this.fill.unselect();
        this.erase.unselect();
        break;
      case DrawToolDto.Line:
        this.pencil.unselect();
        this.line.select();
        this.fill.unselect();
        this.erase.unselect();
        break;
      case DrawToolDto.Erase:
        this.pencil.unselect();
        this.line.unselect();
        this.fill.unselect();
        this.erase.select();
        break;
      case DrawToolDto.Fill:
        this.pencil.unselect();
        this.line.unselect();
        this.fill.select();
        this.erase.unselect();
        break;
    }
    this.toolValue = tool;
  }

  undo(): void {
    this.parent.drawComponent.drawArea.undo();
    if (this.parent.drawComponent.drawArea.canUndo()) {
      this.undoButton.select();
    } else {
      this.undoButton.unselect();
    }
    if (this.parent.drawComponent.drawArea.canRedo()) {
      this.redoButton.select();
    }
  }

  redo(): void {
    this.parent.drawComponent.drawArea.redo();
    if (this.parent.drawComponent.drawArea.canRedo()) {
      this.redoButton.select();
    } else {
      this.redoButton.unselect();
    }
    if (this.parent.drawComponent.drawArea.canUndo()) {
      this.undoButton.select();
    }
  }

  undoSelect(): void {
    this.undoButton.select();
  }

  redoUnselect(): void {
    this.redoButton.unselect();
  }

  size(): number {
    return this.sizeButton.value();
  }

  tool(): DrawToolDto {
    return this.toolValue;
  }

  setSize(value: number): void {
    this.sizeButton.setSize(value);
  }

  color(): string {
    return this.colorPicker.color();
  }

  focusin(): void {
    if (this.visible) this.el.style.display = 'inline-block';
    this.colorPicker.focusin();
    this.sizeButton.focusin();
  }

  focusout(): void {
    this.el.style.display = 'none';
    this.colorPicker.focusout();
    this.sizeButton.focusout();
  }

  show(): void {
    this.visible = true;
    this.focusin();
  }

  hide(): void {
    this.visible = false;
    this.focusout();
  }

  cleanup(): void {
    this.pencil.cleanup();
    this.line.cleanup();
    this.fill.cleanup();
    this.erase.cleanup();

    this.colorPicker.cleanup();
    this.sizeButton.cleanup();

    this.undoButton.cleanup();
    this.redoButton.cleanup();
  }

  render(): HTMLElement {
    const style = Object.assign({ width: `${this.rect.width}px` }, drawBarStyles);
    applyStylesToElement(this.el, style);

    this.placeComponent(this.pencil.render(), 5);
    this.placeComponent(this.line.render(), 29);
    this.placeComponent(this.fill.render(), 53);
    this.placeComponent(this.erase.render(), 77);

    this.placeComponent(this.colorPicker.render(), 121);
    this.placeComponent(this.sizeButton.render(), 145);

    this.placeComponent(this.undoButton.render(), 169);
    this.placeComponent(this.redoButton.render(), 193);

    return this.el;
  }

  private placeComponent(component: HTMLElement, x: number): void {
    this.el.appendChild(component);
    iconStyles.left = `${x}px`;
    applyStylesToElement(component, iconStyles);
  }

  resize(rect: PinRectangle): void {
    applyStylesToElement(this.el, {
      width: `${rect.width}px`
    });
  }
}
