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
import { HtmlComponent, HtmlObject } from '@common/model/html.model';
import { BorderStore } from '../store/border.store';
import { applyStylesToElement } from '@common/style.utils';
import { contentCalculatePinPoint } from '../fn/content-calculate-pin-point';
import { fnConsoleLog } from '@common/fn/console.fn';
import { pinStyles } from './styles/pin.styles';
import { scrollToElementFn } from '../fn/scroll-to-element.fn';
import PinPoint = Pinmenote.Pin.PinPoint;

class ScrollCheck {
  private lastPosition = 0;
  private noChanged = 0;
  private maxNoChanged = 5;
  constructor(private targetPosition: number) {}

  get isTarget(): boolean {
    const scrollY = window.scrollY;

    // Check if changed and if not increase security mark for infinite setInterval
    scrollY === this.lastPosition ? this.noChanged++ : (this.noChanged = 0);
    if (this.noChanged >= this.maxNoChanged) return true;

    this.lastPosition = scrollY;

    return this.targetPosition > 0 && Math.abs(scrollY - this.targetPosition) > 5;
  }
}

export class HtmlLinkComponent implements HtmlComponent {
  private el = document.createElement('div');
  private xy?: PinPoint;
  private scrollCheck?: ScrollCheck;

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
  }

  get isDrag(): boolean {
    return true;
  }

  render(): HTMLElement {
    this.ref.style.border = BorderStore.borderStyle;
    this.ref.style.borderRadius = BorderStore.borderRadius;
    const s = document.createElement('div');
    s.innerText = this.object.value;
    this.el.appendChild(s);
    return this.el;
  }

  private apply = (): void => {
    if (!this.scrollCheck?.isTarget) {
      setTimeout(this.apply, 100);
    } else {
      this.xy = contentCalculatePinPoint(
        this.ref,
        this.size,
        this.object.locator.elementSize,
        this.object.locator.offset
      );
      const styles = Object.assign(
        {
          left: `${Math.floor(this.xy.x)}px`,
          top: `${Math.floor(this.xy.y)}px`,
          border: BorderStore.borderStyle,
          'border-radius': BorderStore.borderRadius
        },
        pinStyles
      );
      applyStylesToElement(this.el, styles);
    }
  };

  cleanup(): void {
    this.el.remove();
  }

  focus(goto: boolean): void {
    if (goto) {
      const position = scrollToElementFn(this.ref, this.size.height);
      this.scrollCheck = new ScrollCheck(position);
    }
    this.el.focus();
    this.apply();
  }

  resize(): void {
    fnConsoleLog('resize');
  }
}
