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
import { ICommand } from '../../../../common/model/shared/common.dto';
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { ObjPdfDataDto, ObjPdfDto } from '../../../../common/model/obj/obj-pdf.dto';
import { SyncObjectCommand } from './sync-object.command';
import { SyncObjectStatus } from '../../../../common/model/sync.model';
import { BeginTxResponse, SyncHashType } from '../../api/store/api-store.model';
import { ObjectStoreKeys } from '../../../../common/keys/object.store.keys';
import { BrowserStorage } from '@pinmenote/browser-api';
import { ApiSegmentAddCommand } from '../../api/store/segment/api-segment-add.command';
import { SyncCryptoFactory } from '../crypto/sync-crypto.factory';

export class SyncPdfCommand implements ICommand<Promise<SyncObjectStatus>> {
  constructor(private obj: ObjDto<ObjPdfDto>, private tx: BeginTxResponse) {}
  async execute(): Promise<SyncObjectStatus> {
    const data = this.obj.data;
    await new SyncObjectCommand(this.obj, data.hash, this.tx).execute();

    await this.syncPdf(data.hash);
    await this.syncData(data.data, data.hash);

    return SyncObjectStatus.OK;
  }

  private async syncData(data: ObjPdfDataDto, parent: string): Promise<void> {
    const content = JSON.stringify(data);
    await new ApiSegmentAddCommand(this.tx, content, {
      key: await SyncCryptoFactory.newKey(),
      type: SyncHashType.ObjPdfDataDto,
      hash: data.hash,
      parent
    }).execute();
  }

  private async syncPdf(hash: string): Promise<void> {
    const pdfData = await BrowserStorage.get<string | undefined>(`${ObjectStoreKeys.PDF_DATA}:${hash}`);
    if (!pdfData) return;
    await new ApiSegmentAddCommand(this.tx, pdfData, {
      key: await SyncCryptoFactory.newKey(),
      type: SyncHashType.ObjPdf,
      hash
    }).execute();
  }
}
