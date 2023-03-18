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
import { HtmlComponent } from '../../../common/model/html.model';
import { ObjDto } from '../../../common/model/obj/obj.dto';
import { ObjPagePinDto } from '../../../common/model/obj/obj-pin.dto';
import { ObjRectangleDto } from '../../../common/model/obj/obj-utils.dto';
import { TextEditContainerComponent } from './text-edit-container.component';
import { applyStylesToElement } from '../../../common/style.utils';

const elStyles = {
  'min-height': '40px',
  'background-color': '#ffffff'
};

export class TextContainerComponent implements HtmlComponent<HTMLElement> {
  private el = document.createElement('div');

  private editContainer: TextEditContainerComponent;

  constructor(private object: ObjDto<ObjPagePinDto>, rect: ObjRectangleDto) {
    this.editContainer = new TextEditContainerComponent(object, rect);
  }

  render(): HTMLElement {
    applyStylesToElement(this.el, elStyles);
    const text = this.editContainer.render();
    this.el.appendChild(text);
    this.el.style.display = 'none';

    return this.el;
  }

  focus(): void {
    this.editContainer.focus();
  }

  resize(rect: ObjRectangleDto): void {
    this.editContainer.resize(rect);
  }

  show(): void {
    this.el.style.display = 'inline-block';
    this.editContainer.focus();
  }

  hide(): void {
    this.el.style.display = 'none';
  }

  cleanup(): void {
    this.editContainer.cleanup();
  }
}
