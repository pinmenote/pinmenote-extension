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
import { ObjContentDto } from '../../common/model/obj/obj-content.dto';
import { PinModel } from '../components/pin.model';

export interface HtmlIntermediateData {
  html: string;
  content: ObjContentDto[];
}

export interface HtmlComponentFocusable {
  focusin(): void;
  focusout(): void;
}

export interface PageComponent {
  model: PinModel; // TODO REMOVE here
  focus(goto: boolean): void;
  cleanup(): void;
  resize(): void;
  render(): any;
  isHidden(): boolean;
}

export interface HtmlComponent<T> {
  render(): T;
}
