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
import { ObjCanvasDto, ObjSnapshotDto } from '../../../common/model/obj/obj-snapshot.dto';
import { HtmlSkipAttribute } from '../../model/html.model';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjUrlDto } from '../../../common/model/obj/obj.dto';
import { PinStore } from '../../store/pin.store';
import { ScreenshotFactory } from '../../../common/factory/screenshot.factory';
import { SettingsConfig } from '../../../common/environment';
import { SnapshotContentSaveCommand } from './snapshot-content-save.command';
import { SnapshotSaveImageCommand } from './snapshot-save-image.command';
import { XpathFactory } from '../../../common/factory/xpath.factory';

export class SnapshotCreateCommand implements ICommand<Promise<ObjSnapshotDto>> {
  constructor(
    private settings: SettingsConfig,
    private url: ObjUrlDto,
    private element: HTMLElement,
    private skipAttributes: HtmlSkipAttribute[],
    private canvas?: ObjCanvasDto
  ) {}

  async execute(): Promise<ObjSnapshotDto> {
    PinStore.each((v) => v.hide());
    const rect = this.canvas ? this.canvas.rect : XpathFactory.computeRect(this.element);
    let contentId = -1;
    let words: string[] = [];
    if (!this.canvas) {
      const res = await new SnapshotContentSaveCommand(this.element, this.skipAttributes).execute();
      contentId = res.id;
      words = res.words;
    } else if (this.element instanceof HTMLImageElement) {
      contentId = await new SnapshotSaveImageCommand(this.element).execute();
    }
    const screenshot = await ScreenshotFactory.takeScreenshot(
      { settings: this.settings, document, window },
      rect,
      this.url
    );
    const title = this.element.innerText.substring(0, 100) || document.title;
    PinStore.each((v) => v.show());
    return {
      title,
      url: this.url,
      words,
      hashtags: [],
      canvas: this.canvas,
      screenshot,
      contentId
    };
  }
}
