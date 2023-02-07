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
import { ObjRectangleDto, ObjSizeDto } from './obj-utils.model';
import { ObjDrawDto } from './obj-draw.model';
import { ObjUrlDto } from './obj.model';

export interface ObjPagePinDto {
  theme: string;
  xpath: string;
  url: ObjUrlDto;
  html: PinHtmlDataDto[];
  video: PinVideoDataDto[];
  draw: ObjDrawDto[];
  value: string;
  title: string;
  htmlEdit?: string;
}

export interface ObjCanvasPinDto {
  windowSize: ObjSizeDto;
  rect: ObjRectangleDto;
  screenshot?: string;
  url: ObjUrlDto;
  draw: ObjDrawDto[];
  value: string;
  title: string;
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
  css: PinCssDataDto;
}

export interface PinCssDataDto {
  css: string;
  href: PinCssHref[];
}

export interface PinCssHref {
  href: string;
  data?: string;
}

interface PinBorderDataDto {
  radius: string;
  style: string;
}
