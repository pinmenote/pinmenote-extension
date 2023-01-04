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
import LinkDto = Pinmenote.Pin.LinkDto;

export enum ObjectTypeDto {
  Pin = 1,
  Link = 2,
  Note
}

export interface HtmlIntermediateData {
  cssStyles: string[];
  html: string;
  videoTime: ContentVideoTime[];
}

export interface HtmlParentStyles {
  cssStyles: string[];
  html: string;
}

export interface CssData {
  css: string;
  href: string[];
}

export interface ContentVideoTime {
  currentTime: number;
  displayTime: number;
  xpath: string;
}

export interface HtmlContent {
  theme?: string;
  bodyStyle?: string;
  title: string;
  html: string;
  videoTime: ContentVideoTime[];
  css: CssData;
  elementText: string;
}

export interface HtmlComponent {
  object: HtmlObject;
  ref: HTMLElement;
  get isDrag(): boolean;
  render(): HTMLElement;
  cleanup(): void;
  focus(goto: boolean): void;
  resize(): void;
}

export interface HtmlObject extends LinkDto {
  uid: string;
  type: ObjectTypeDto;
}
