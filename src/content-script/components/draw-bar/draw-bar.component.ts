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
import { DrawBrushSizeButton } from './draw-buttons/draw-brush-size.button';
import { DrawColorPickerButton } from './draw-buttons/draw-color-picker.button';
import { DrawEraseButton } from './draw-buttons/draw-erase.button';
import { DrawFillButton } from './draw-buttons/draw-fill.button';
import { DrawLineButton } from './draw-buttons/draw-line.button';
import { DrawPencilButton } from './draw-buttons/draw-pencil.button';
import { DrawRedoButton } from './draw-buttons/draw-redo.button';
import { DrawToolDto } from '../../../common/model/obj-draw.model';
import { DrawUndoButton } from './draw-buttons/draw-undo.button';
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

  private readonly pencil: DrawPencilButton;
  private readonly line: DrawLineButton;
  private readonly fill: DrawFillButton;
  private readonly erase: DrawEraseButton;

  private readonly colorPicker: DrawColorPickerButton;
  private readonly sizeButton: DrawBrushSizeButton;

  private readonly undoButton: DrawUndoButton;
  private readonly redoButton: DrawRedoButton;

  constructor(private parent: PinComponent, private rect: PinRectangle) {
    this.pencil = new DrawPencilButton(this);
    this.line = new DrawLineButton(this);
    this.fill = new DrawFillButton(this);
    this.erase = new DrawEraseButton(this);

    this.colorPicker = new DrawColorPickerButton(rect, parent);
    this.sizeButton = new DrawBrushSizeButton(parent);

    this.undoButton = new DrawUndoButton(this);
    this.redoButton = new DrawRedoButton(this);
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

    this.adjustTop();

    return this.el;
  }

  private placeComponent(component: HTMLElement, x: number): void {
    this.el.appendChild(component);
    iconStyles.left = `${x}px`;
    applyStylesToElement(component, iconStyles);
  }

  resize(rect: PinRectangle): void {
    this.rect = rect;
    this.el.style.width = `${rect.width}px`;
    this.adjustTop();
  }

  /**
   * Element is on top of page that's why we show bar overlapping element
   * @private
   */
  private adjustTop(): void {
    if (this.rect.y === 0) {
      this.el.style.top = '24px';
    } else {
      this.el.style.top = '-24px';
    }
  }
}
