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
import { PageSegmentDto, SegmentTypeDto } from '../../../common/model/obj/page-segment.dto';
import { HtmlImgFactory } from '../../factory/html/html-img.factory';
import { ICommand } from '../../../common/model/shared/common.dto';
import { PageSegmentAddCommand } from '../../../common/command/snapshot/segment/page-segment-add.command';
import { fnSha256 } from '../../../common/fn/fn-sha256';

export class ContentPageSegmentSaveImageCommand implements ICommand<Promise<string>> {
  constructor(private element: HTMLElement) {}

  async execute(): Promise<string> {
    const value = await HtmlImgFactory.computeImgValue(this.element as HTMLImageElement, {
      ref: this.element,
      depth: 1,
      visitedUrl: {},
      skipAttributes: [],
      skipTagCache: new Set<string>(),
      skipUrlCache: new Set<string>(),
      isPartial: false,
      insideLink: false,
      contentCallback: () => {
        /*IGNORE*/
      }
    });

    const html = `<img src="${value}" />`;
    const hash = fnSha256(html);
    await this.contentCallback({
      hash,
      type: SegmentTypeDto.SNAPSHOT,
      content: {
        html: {
          hash,
          html,
          htmlAttr: ''
        },
        css: [],
        assets: []
      }
    });
    return hash;
  }

  private contentCallback = async (content: PageSegmentDto) => {
    await new PageSegmentAddCommand(content).execute();
  };
}