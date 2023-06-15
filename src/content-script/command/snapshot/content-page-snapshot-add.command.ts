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
import { BrowserApi } from '@pinmenote/browser-api';
import { BusMessageType } from '../../../common/model/bus.model';
import { ContentPageSnapshotCreateCommand } from './content-page-snapshot-create.command';
import { ContentPdfSaveCommand } from './content-pdf-save.command';
import { ICommand } from '../../../common/model/shared/common.dto';
import { PageSnapshotAddCommand } from '../../../common/command/snapshot/page-snapshot-add.command';
import { PinStore } from '../../store/pin.store';
import { SettingsConfig } from '../../../common/environment';

export class ContentPageSnapshotAddCommand implements ICommand<Promise<void>> {
  constructor(private settings: SettingsConfig, private url: ObjUrlDto) {}

  async execute(): Promise<void> {
    if (this.url.href.endsWith('.pdf')) {
      await new ContentPdfSaveCommand(this.url).execute();
      await BrowserApi.sendRuntimeMessage({ type: BusMessageType.POPUP_PAGE_SNAPSHOT_ADD });
    } else {
      const pageSnapshot = await new ContentPageSnapshotCreateCommand(
        this.settings,
        this.url,
        document.body,
        [],
        undefined
      ).execute();
      await new PageSnapshotAddCommand(pageSnapshot, ObjTypeDto.PageSnapshot).execute();

      await BrowserApi.sendRuntimeMessage({ type: BusMessageType.POPUP_PAGE_SNAPSHOT_ADD });
      PinStore.each((v) => v.show());
    }
  }
}
