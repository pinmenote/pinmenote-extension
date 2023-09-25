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
import { BrowserStorage } from '@pinmenote/browser-api';
import { ICommand } from '../../../../common/model/shared/common.dto';
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { ObjPageNoteDto } from '../../../../common/model/obj/obj-note.dto';
import { SyncObjectCommand } from './sync-object.command';
import { SyncObjectStatus } from '../sync.model';
import { fnConsoleLog } from '../../../../common/fn/fn-console';
import { BeginTxResponse, SyncHashType } from '../../api/store/api-store.model';
import { ObjectStoreKeys } from '../../../../common/keys/object.store.keys';
import { ApiSegmentAddCommand } from '../../api/store/segment/api-segment-add.command';
import { SyncCryptoFactory } from '../crypto/sync-crypto.factory';

export class SyncPageNoteCommand implements ICommand<Promise<SyncObjectStatus>> {
  constructor(private obj: ObjDto<ObjPageNoteDto>, private tx: BeginTxResponse) {}
  async execute(): Promise<SyncObjectStatus> {
    const data = this.obj.data;

    await new SyncObjectCommand(this.obj, data.hash, this.tx).execute();

    await this.syncNote(data);

    return SyncObjectStatus.OK;
  }

  private async syncNote(data: ObjPageNoteDto): Promise<void> {
    const content = JSON.stringify(data);
    await new ApiSegmentAddCommand(this.tx, content, {
      hash: data.hash,
      parent: data.hash,
      type: SyncHashType.ObjPdfDataDto,
      key: await SyncCryptoFactory.newKey()
    }).execute();
    if (data.prev) {
      const prevData = await BrowserStorage.get<ObjPageNoteDto>(`${ObjectStoreKeys.NOTE_HASH}:${data.prev}`);
      fnConsoleLog('SyncPageNoteCommand->prev', data.prev, 'data', prevData);
      await this.syncNote(prevData);
    }
  }
}
