/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2022 Michal Szczepanski.
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
import { BottomBarComponent } from './bottom-bar/bottom-bar.component';
import { EditorComponent } from './editor.component';
import { HtmlComponent } from '../../common/model/html.model';
import { PinObject } from '../../common/model/pin.model';
import { SettingsStore } from '../store/settings.store';
import { TopBarComponent } from './top-bar/top-bar.component';
import { applyStylesToElement } from '../../common/style.utils';
import { contentCalculatePinPoint } from '../fn/content-calculate-pin-point';
import { pinStyles } from './styles/pin.styles';
import PinPoint = Pinmenote.Pin.PinPoint;

const pinContainerStyles = {
  'box-sizing': 'border-box',
  'background-color': '#ffffff',
  'border-alpha': '0.5',
  padding: '5px',
  minWidth: '200px',
  minHeight: '50px'
};

export class PinComponent implements HtmlComponent {
  private readonly el = document.createElement('div');
  private readonly pinContainer = document.createElement('div');

  private readonly topbar: TopBarComponent;
  private readonly bottombar: BottomBarComponent;
  private readonly editor: EditorComponent;

  private xy: PinPoint;
  private drag = false;

  private refValue: HTMLElement;

  readonly object: PinObject;

  constructor(ref: HTMLElement, pin: PinObject) {
    this.el.id = pin.uid;
    this.refValue = ref;
    this.object = pin;
    this.xy = contentCalculatePinPoint(this.refValue, pin.size, pin.locator.elementSize, pin.locator.offset);
    this.editor = new EditorComponent(this.object);
    this.topbar = new TopBarComponent(pin, ref);
    this.bottombar = new BottomBarComponent(pin);
  }

  setNewRef(ref: HTMLElement): void {
    this.refValue = ref;
  }

  get container(): HTMLElement {
    return this.el;
  }

  get ref(): HTMLElement {
    return this.refValue;
  }

  focus(goto = false): void {
    this.editor.focus(goto);
  }

  restoreBorder(): void {
    this.refValue.style.border = this.object.border.style;
    this.refValue.style.borderRadius = this.object.border.radius;
  }

  render(): HTMLElement {
    const styles = Object.assign(
      {
        left: `${this.xy.x}px`,
        top: `${this.xy.y}px`
      },
      pinStyles
    );

    applyStylesToElement(this.el, styles);
    this.el.appendChild(this.topbar.render());

    applyStylesToElement(this.pinContainer, pinContainerStyles);
    this.pinContainer.style.border = SettingsStore.borderStyle;
    this.pinContainer.style.borderRadius = SettingsStore.borderRadius;

    this.pinContainer.appendChild(this.editor.render());

    this.el.appendChild(this.pinContainer);

    this.el.appendChild(this.bottombar.render());

    this.el.addEventListener('mouseover', this.handleMouseOver);
    this.el.addEventListener('mouseout', this.handleMouseOut);

    this.topbar.setEditor(this.editor.editor);

    return this.el;
  }

  startDrag(): void {
    this.drag = true;
  }

  updateDrag(value: PinPoint): void {
    const newX = this.xy.x + value.x;
    const newY = this.xy.y + value.y;
    this.el.style.left = `${newX}px`;
    this.el.style.top = `${newY}px`;
  }

  stopDrag(value: PinPoint): void {
    const { offset, elementSize } = this.object.locator;
    offset.x = offset.x + value.x;
    offset.y = offset.y + value.y;
    this.object.locator.offset = offset;
    this.xy = contentCalculatePinPoint(this.refValue, this.object.size, elementSize, offset);
    this.drag = false;
  }

  get isDrag(): boolean {
    return this.drag;
  }

  resize(): void {
    const { elementSize, offset } = this.object.locator;
    this.xy = contentCalculatePinPoint(this.refValue, this.object.size, elementSize, offset);
    this.el.style.left = `${this.xy.x}px`;
    this.el.style.top = `${this.xy.y}px`;
  }

  cleanup(): void {
    this.el.removeEventListener('mouseover', this.handleMouseOver);
    this.el.removeEventListener('mouseout', this.handleMouseOut);

    this.refValue.style.border = this.object.border.style;
    this.refValue.style.borderRadius = this.object.border.radius;

    this.editor.cleanup();
    this.topbar.cleanup();
    this.bottombar.cleanup();
    this.el.remove();
  }

  private handleMouseOver = () => {
    this.topbar.focusin();
    this.bottombar.focusin();
  };

  private handleMouseOut = () => {
    this.topbar.focusout();
    this.bottombar.focusout();
  };
}
