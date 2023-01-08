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
import { HtmlComponent, HtmlObject } from '../../common/model/html.model';
import { SettingsStore } from '../store/settings.store';
import { applyStylesToElement } from '../../common/style.utils';
import { contentCalculatePinPoint } from '../fn/content-calculate-pin-point';
import { fnConsoleLog } from '../../common/fn/console.fn';
import { pinStyles } from './styles/pin.styles';
import { scrollToElementFn } from '../fn/scroll-to-element.fn';
import PinPoint = Pinmenote.Pin.PinPoint;

class ContentCheck {
  private rect: DOMRect;
  constructor(private ref: HTMLElement) {
    this.rect = ref.getBoundingClientRect();
  }

  get isTarget(): boolean {
    const rect = this.ref.getBoundingClientRect();
    const isEqual =
      rect.x == this.rect.x &&
      rect.y == this.rect.y &&
      rect.width == this.rect.width &&
      rect.height == this.rect.height &&
      rect.top == this.rect.top;
    this.rect = rect;
    return isEqual;
  }
}

export class HtmlLinkComponent implements HtmlComponent {
  private el = document.createElement('div');
  private xy?: PinPoint;

  private contentCheck: ContentCheck;
  ref: HTMLElement;

  readonly object: HtmlObject;
  private readonly size = {
    width: 163,
    height: 34
  };

  constructor(ref: HTMLElement, object: HtmlObject) {
    this.el.id = object.uid;
    this.ref = ref;
    this.object = object;
    this.contentCheck = new ContentCheck(this.ref);
  }

  render(): HTMLElement {
    this.ref.style.border = SettingsStore.borderStyle;
    this.ref.style.borderRadius = SettingsStore.borderRadius;
    const s = document.createElement('div');
    s.innerText = this.object.value;
    this.el.appendChild(s);
    return this.el;
  }

  private apply = (goto = false): void => {
    if (!this.contentCheck.isTarget) {
      setTimeout(() => this.apply(goto), 250);
    } else {
      this.xy = contentCalculatePinPoint(this.ref, this.size);
      const styles = Object.assign(
        {
          left: `${Math.floor(this.xy.x)}px`,
          top: `${Math.floor(this.xy.y)}px`,
          border: SettingsStore.borderStyle,
          'border-radius': SettingsStore.borderRadius
        },
        pinStyles
      );
      applyStylesToElement(this.el, styles);
      if (goto) {
        scrollToElementFn(this.ref, this.size.height);
        this.el.focus();
      }
    }
  };

  cleanup(): void {
    this.el.remove();
  }

  focus = (goto: boolean): void => {
    this.apply(goto);
  };

  resize(): void {
    fnConsoleLog('resize');
  }
}
