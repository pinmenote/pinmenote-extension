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
import { ObjTypeDto, ObjUrlDto } from '../../../common/model/obj/obj.dto';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjSnapshotDto } from '../../../common/model/obj/obj-snapshot.dto';
import { PageSnapshotAddCommand } from '../../../common/command/snapshot/page-snapshot-add.command';
import { PinStore } from '../../store/pin.store';
import { ScreenshotFactory } from '../../../common/factory/screenshot.factory';
import { SettingsConfig } from '../../../common/environment';
import { SnapshotContentSaveCommand } from './snapshot-content-save.command';

export class ContentPageSnapshotAddCommand implements ICommand<Promise<void>> {
  constructor(private settings: SettingsConfig, private url: ObjUrlDto) {}

  async execute(): Promise<void> {
    PinStore.each((v) => v.hide());
    const screenshot = await ScreenshotFactory.takeScreenshot(
      {
        document,
        window,
        settings: this.settings
      },
      undefined,
      this.url
    );

    const res = await new SnapshotContentSaveCommand(document.body, [], false).execute();

    const dto: ObjSnapshotDto = {
      title: document.title || this.url.origin, // sometimes document don't have title
      url: this.url,
      screenshot,
      contentId: res.id,
      words: res.words,
      hashtags: []
    };
    await new PageSnapshotAddCommand(dto, ObjTypeDto.PageSnapshot).execute();

    await BrowserApi.sendRuntimeMessage({ type: BusMessageType.POPUP_PAGE_SNAPSHOT_ADD });
    PinStore.each((v) => v.show());
  }
}
