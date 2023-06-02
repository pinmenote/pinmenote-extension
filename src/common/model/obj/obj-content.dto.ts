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

export interface ContentCssDto {
  href?: string;
  media?: string;
  data: string;
}

export interface ContentSnapshotDto {
  html: ContentHtmlDto;
  css: string[];
  assets: string[];
}

interface ContentHtmlDto {
  hash: string;
  html: string;
  htmlAttr: string;
}

export interface ContentShadowDto {
  html: string;
}

export interface ContentImgDto {
  src: string;
}

export enum ContentTypeDto {
  IFRAME = 1,
  IMG,
  SHADOW,
  CSS
}

type PageContent = ContentCssDto | ContentSnapshotDto | ContentShadowDto | ContentImgDto;

export interface PageContentDto<T = PageContent> {
  type: ContentTypeDto;
  hash: string;
  content: T;
}
