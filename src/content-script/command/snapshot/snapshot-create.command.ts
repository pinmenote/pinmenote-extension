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
import { ObjCanvasDto, ObjSnapshotDto, ObjVideoDataDto } from '../../../common/model/obj/obj-snapshot.dto';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjUrlDto } from '../../../common/model/obj/obj.dto';
import { ScreenshotFactory } from '../../../common/factory/screenshot.factory';
import { SnapshotContentSaveCommand } from './snapshot-content-save.command';
import { SnapshotSaveImageCommand } from './snapshot-save-image.command';
import { XpathFactory } from '../../../common/factory/xpath.factory';

export class SnapshotCreateCommand implements ICommand<Promise<ObjSnapshotDto>> {
  constructor(private url: ObjUrlDto, private element: HTMLElement, private canvas?: ObjCanvasDto) {}

  async execute(): Promise<ObjSnapshotDto> {
    const rect = this.canvas ? this.canvas.rect : XpathFactory.computeRect(this.element);
    let contentId = -1;
    let words: string[] = [];
    let video: ObjVideoDataDto[] = [];
    if (!this.canvas) {
      const res = await new SnapshotContentSaveCommand(this.element).execute();
      contentId = res.id;
      words = res.words;
      video = res.video;
    } else if (this.element instanceof HTMLImageElement) {
      // TODO save image
      contentId = await new SnapshotSaveImageCommand(this.element).execute();
    }
    const screenshot = await ScreenshotFactory.takeScreenshot(rect, this.url);
    const title = this.element.innerText.substring(0, 100) || document.title;
    return {
      title,
      url: this.url,
      words,
      hashtags: [],
      video,
      canvas: this.canvas,
      screenshot,
      contentId
    };
  }
}
