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

export interface HtmlIntermediateData {
  html: string;
  content: ObjContentDto[];
}

export interface HtmlSkipAttribute {
  key: string;
  value: string;
}

export interface HtmlComputeParams {
  ref: Element;
  depth: number;
  visitedUrl: { [key: string]: string };
  skipAttributes: HtmlSkipAttribute[];
  skipTagCache: Set<string>;
  skipUrlCache: Set<string>;
  isPartial: boolean;
  insideLink: boolean; // detect and mitigate link inside link hacks inside html generators
}
