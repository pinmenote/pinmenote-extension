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
import { HtmlComponent, HtmlComponentFocusable } from '../../model/html.model';
import { ContentButton } from '../base/content-button';
import { DrawBrushSizeButton } from './draw-buttons/draw-brush-size.button';
import { DrawColorPickerButton } from './draw-buttons/draw-color-picker.button';
import { DrawEraseButton } from './draw-buttons/draw-erase.button';
import { DrawFillButton } from './draw-buttons/draw-fill.button';
import { DrawLineButton } from './draw-buttons/draw-line.button';
import { DrawPencilButton } from './draw-buttons/draw-pencil.button';
import { DrawRedoButton } from './draw-buttons/draw-redo.button';
import { DrawTestButton } from './draw-buttons/draw-test.button';
import { DrawToolDto } from '../../../common/model/obj/obj-draw.dto';
import { DrawUndoButton } from './draw-buttons/draw-undo.button';
import { PinModel } from '../pin.model';
import { applyStylesToElement } from '../../../common/style.utils';

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

  private readonly pencil: DrawPencilButton;
  private readonly line: DrawLineButton;
  private readonly fill: DrawFillButton;
  private readonly erase: DrawEraseButton;

  private readonly colorPicker: DrawColorPickerButton;
  private readonly sizeButton: DrawBrushSizeButton;

  private readonly undoButton: DrawUndoButton;
  private readonly redoButton: DrawRedoButton;

  private readonly drawTest: DrawTestButton;

  private readonly saveButton: ContentButton;

  constructor(private model: PinModel) {
    this.pencil = new DrawPencilButton(this);
    this.line = new DrawLineButton(this);
    this.fill = new DrawFillButton(this);
    this.erase = new DrawEraseButton(this);

    this.colorPicker = new DrawColorPickerButton(model);
    this.sizeButton = new DrawBrushSizeButton(model);

    this.undoButton = new DrawUndoButton(this);
    this.redoButton = new DrawRedoButton(this);

    // TODO move logic to model
    this.model.draw.setUndoButton(this.undoButton);
    this.model.draw.setRedoButton(this.redoButton);

    this.drawTest = new DrawTestButton(model);

    this.saveButton = new ContentButton('save', this.handleSaveClick);
  }

  handleSaveClick = async (): Promise<void> => {
    await this.model.draw.saveDraw(this.model);
  };

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
    this.model.draw.tool = tool;
  }

  undo(): void {
    if (!this.model.draw.area) return;
    this.model.draw.area.undo();
    if (this.model.draw.area.canUndo()) {
      this.undoButton.select();
    } else {
      this.undoButton.unselect();
    }
    if (this.model.draw.area.canRedo()) {
      this.redoButton.select();
    }
  }

  redo(): void {
    if (!this.model.draw.area) return;
    this.model.draw.area.redo();
    if (this.model.draw.area.canRedo()) {
      this.redoButton.select();
    } else {
      this.redoButton.unselect();
    }
    if (this.model.draw.area.canUndo()) {
      this.undoButton.select();
    }
  }

  setSize(value: number): void {
    this.sizeButton.setSize(value);
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

    this.drawTest.cleanup();
  }

  render(): HTMLElement {
    const style = Object.assign({ width: `${this.model.rect.width}px` }, drawBarStyles);
    applyStylesToElement(this.el, style);

    this.placeComponent(this.pencil.render(), 5);
    this.placeComponent(this.line.render(), 29);
    this.placeComponent(this.fill.render(), 53);
    this.placeComponent(this.erase.render(), 77);

    this.placeComponent(this.colorPicker.render(), 121);
    this.placeComponent(this.sizeButton.render(), 145);

    this.placeComponent(this.undoButton.render(), 169);
    this.placeComponent(this.redoButton.render(), 193);

    // this.placeComponent(this.drawTest.render(), 220);
    this.placeComponent(this.saveButton.render(), this.model.rect.width - 35);

    this.adjustTop();

    return this.el;
  }

  private placeComponent(component: HTMLElement, x: number): void {
    this.el.appendChild(component);
    iconStyles.left = `${x}px`;
    applyStylesToElement(component, iconStyles);
  }

  resize(): void {
    this.el.style.width = `${this.model.rect.width}px`;
    this.adjustTop();
  }

  /**
   * Element is on top of page that's why we show bar overlapping element
   * @private
   */
  private adjustTop(): void {
    if (this.model.rect.y === 0) {
      this.el.style.top = '24px';
    } else {
      this.el.style.top = '-24px';
    }
  }
}
