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
import { BrowserApi } from '@pinmenote/browser-api';
import { BusDownloadMessageFirefox } from '../../../common/model/bus.model';
import { ICommand } from '../../../common/model/shared/common.dto';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { fnB64toBlob } from '../../../common/fn/fn-b64-to-blob';
import { fnUid } from '../../../common/fn/fn-uid';

export class ContentDownloadFirefoxCommand implements ICommand<Promise<void>> {
  constructor(private data: BusDownloadMessageFirefox) {}
  async execute(): Promise<void> {
    fnConsoleLog('ContentDownloadFirefoxCommand->execute');
    let url = '';
    let filename = '';
    switch (this.data.type) {
      case 'jpeg': {
        url = URL.createObjectURL(fnB64toBlob(this.data.data));
        filename = `${fnUid()}.jpg`;
        break;
      }
      case 'png': {
        url = URL.createObjectURL(fnB64toBlob(this.data.data));
        filename = `${fnUid()}.png`;
        break;
      }
      case 'csv': {
        const blob = new Blob([this.data.data], { type: 'text/csv' });
        url = URL.createObjectURL(blob);
        filename = `${fnUid()}.csv`;
        break;
      }
    }
    if (!url || !filename) return;
    await BrowserApi.downloads.download({
      url,
      filename,
      conflictAction: 'uniquify'
    });
  }
}
