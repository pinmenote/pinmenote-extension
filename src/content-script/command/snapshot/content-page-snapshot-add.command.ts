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
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjSnapshotDto } from '../../../common/model/obj/obj-snapshot.dto';
import { ObjUrlDto } from '../../../common/model/obj/obj.dto';
import { PageSnapshotAddCommand } from '../../../common/command/snapshot/page-snapshot-add.command';
import { ScreenshotFactory } from '../../../common/factory/screenshot.factory';
import { SnapshotContentSaveCommand } from './snapshot-content-save.command';

export class ContentPageSnapshotAddCommand implements ICommand<Promise<void>> {
  constructor(private url: ObjUrlDto, private href?: string) {}

  async execute(): Promise<void> {
    if (this.href !== this.url.href) {
      // fnConsoleLog('SKIP', this.href, this.url.href);
      return;
    }
    const screenshot = await ScreenshotFactory.takeScreenshot(undefined, this.url);

    const res = await new SnapshotContentSaveCommand(document.body, false).execute();

    const dto: ObjSnapshotDto = {
      title: document.title,
      url: this.url,
      screenshot,
      contentId: res.id,
      words: res.words,
      hashtags: []
    };
    await new PageSnapshotAddCommand(dto).execute();

    await BrowserApi.sendRuntimeMessage({ type: BusMessageType.POPUP_PAGE_SNAPSHOT_ADD });
  }
}
