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
import { ContentSettingsStore } from '../store/content-settings.store';
import { HtmlComponent } from '../../common/model/html.model';
import { PinObject } from '../../common/model/pin.model';
import { PinPointFactory } from '../factory/pin-point.factory';
import { TextEditorComponent } from './text-editor.component';
import { applyStylesToElement } from '../../common/style.utils';
import { pinStyles } from './styles/pin.styles';
import PinRectangle = Pinmenote.Pin.PinRectangle;

export class PinComponent implements HtmlComponent {
  private readonly el = document.createElement('div');
  private readonly textEditor: TextEditorComponent;

  private xy: PinRectangle;

  private refValue: HTMLElement;

  readonly object: PinObject;

  constructor(ref: HTMLElement, pin: PinObject) {
    this.el.id = pin.uid;
    this.refValue = ref;
    this.object = pin;
    this.xy = PinPointFactory.calculateRect(this.refValue);
    this.textEditor = new TextEditorComponent(this.object, this.xy);
  }

  get ref(): HTMLElement {
    return this.refValue;
  }

  focus(goto = false): void {
    this.textEditor.focus(goto);
  }

  render(): HTMLElement {
    const styles = Object.assign(
      {
        left: `${this.xy.x}px`,
        top: `${this.xy.y}px`,
        width: `${this.xy.width}px`,
        height: `${this.xy.height}px`,
        'background-color': '#ffffff00'
      },
      pinStyles
    );

    applyStylesToElement(this.el, styles);
    this.el.appendChild(this.textEditor.render());

    this.refValue.style.border = ContentSettingsStore.borderStyle;
    this.refValue.style.borderRadius = ContentSettingsStore.borderRadius;

    return this.el;
  }

  resize(): void {
    this.xy = PinPointFactory.calculateRect(this.refValue);
    this.el.style.left = `${this.xy.x}px`;
    this.el.style.top = `${this.xy.y}px`;
    this.el.style.width = `${this.xy.width}px`;
    this.el.style.height = `${this.xy.height}px`;
    this.textEditor.resize(this.xy);
  }

  cleanup(): void {
    this.el.removeEventListener('mouseover', this.handleMouseOver);
    this.el.removeEventListener('mouseout', this.handleMouseOut);

    this.refValue.style.border = this.object.border.style;
    this.refValue.style.borderRadius = this.object.border.radius;

    this.textEditor.cleanup();
    /*this.topbar.cleanup();
    this.bottombar.cleanup();*/
    this.el.remove();
  }

  private handleMouseOver = () => {
    /*this.topbar.focusin();
    this.bottombar.focusin();*/
  };

  private handleMouseOut = () => {
    /*this.topbar.focusout();
    this.bottombar.focusout();*/
  };
}
