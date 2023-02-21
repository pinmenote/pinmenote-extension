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
import { ObjCanvasPinDto, ObjPagePinDto } from './obj/obj-pin.dto';
import { ObjDto, ObjLinkDto } from './obj/obj.dto';

export interface HtmlIntermediateData {
  html: string;
  videoTime: ContentVideoTime[];
}

export interface HtmlParentStyles {
  cssStyles: string[];
  html: string;
}

export interface ContentVideoTime {
  currentTime: number;
  displayTime: number;
  xpath: string;
}

export interface HtmlComponentFocusable {
  focusin(): void;
  focusout(): void;
}

export interface PageComponent {
  object: ObjDto<ObjPagePinDto | ObjLinkDto | ObjCanvasPinDto>;
  focus(goto: boolean): void;
  cleanup(): void;
  resize(): void;
  render(): any;
  isHidden(): boolean;
}

export interface HtmlComponent<T> {
  render(): T;
  cleanup?: () => void;
}
