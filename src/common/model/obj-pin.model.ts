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
import { ObjDrawDto } from './obj-draw.model';
import { ObjLinkDto } from './obj.model';
import { ObjRectangleDto } from './obj-utils.model';

export interface ObjPagePinDto {
  title: string;
  theme: string;
  xpath: string;
  link: ObjLinkDto;
  html: PinHtmlDataDto[];
  css: PinCssDataDto;
  video: PinVideoDataDto[];
  draw: ObjDrawDto[];
}

export interface PinVideoDataDto {
  currentTime: number;
  displayTime: number;
  xpath: string;
}

export interface PinHtmlDataDto {
  parentStyle: string;
  screenshot?: string;
  html: string;
  text: string; // innerText value of html
  rect: ObjRectangleDto;
  border: PinBorderDataDto;
}

export interface PinCssDataDto {
  css: string;
  href: string[];
}

interface PinBorderDataDto {
  radius: string;
  style: string;
}
