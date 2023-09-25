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
import { ICommand } from '../../../../common/model/shared/common.dto';
import { ObjGetCommand } from '../../../../common/command/obj/obj-get.command';
import { fnConsoleLog } from '../../../../common/fn/fn-console';
import { BusMessageType } from '../../../../common/model/bus.model';
import { ObjDto, ObjRemovedDto, ObjTypeDto } from '../../../../common/model/obj/obj.dto';
import { SyncSnapshotCommand } from '../outgoing/sync-snapshot.command';
import { ObjPageDto } from '../../../../common/model/obj/obj-page.dto';
import { SyncPinCommand } from '../outgoing/sync-pin.command';
import { ObjPinDto } from '../../../../common/model/obj/obj-pin.dto';
import { SyncPdfCommand } from '../outgoing/sync-pdf.command';
import { ObjPdfDto } from '../../../../common/model/obj/obj-pdf.dto';
import { SyncNoteCommand } from '../outgoing/sync-note.command';
import { ObjNoteDto, ObjPageNoteDto } from '../../../../common/model/obj/obj-note.dto';
import { SyncPageNoteCommand } from '../outgoing/sync-page-note.command';
import { SyncRemovedCommand } from '../outgoing/sync-removed.command';
import { SyncTxHelper } from '../sync-tx.helper';
import { BeginTxResponse } from '../../api/store/api-store.model';
import { SyncObjectStatus } from '../../../../common/model/sync.model';

export class SyncManualOutgoingCommand implements ICommand<Promise<void>> {
  constructor(private id: number) {}
  async execute(): Promise<void> {
    fnConsoleLog('SyncManualOutgoingCommand !!!!!!!!!!');
    const obj = await new ObjGetCommand(this.id).execute();
    if (!obj) {
      fnConsoleLog('SyncObjectCommand->syncObject EMPTY', this.id, obj);
      await this.sendResponse(SyncObjectStatus.OBJECT_NOT_EXISTS);
      return;
    }
    const tx = await SyncTxHelper.begin();
    if (!tx) {
      fnConsoleLog('SyncManualOutgoingCommand !!!!!!!!!! TX', tx);
      await this.sendResponse(SyncObjectStatus.TX_LOCKED);
      return;
    }
    const status = await this.syncObj(obj, tx);
    await this.sendResponse(status);
    fnConsoleLog('SyncManualOutgoingCommand->execute id', obj.id, 'serverId', obj.server?.id);
    await SyncTxHelper.commit();
  }

  private sendResponse = async (status: SyncObjectStatus) => {
    await BrowserApi.sendRuntimeMessage<SyncObjectStatus>({
      type: BusMessageType.OPTIONS_SYNC_OUTGOING_OBJECT,
      data: status
    });
  };

  private syncObj = async (obj: ObjDto, tx: BeginTxResponse) => {
    switch (obj.type) {
      case ObjTypeDto.PageSnapshot:
      case ObjTypeDto.PageElementSnapshot: {
        return await new SyncSnapshotCommand(obj as ObjDto<ObjPageDto>, tx).execute();
      }
      case ObjTypeDto.PageElementPin: {
        return await new SyncPinCommand(obj as ObjDto<ObjPinDto>, tx).execute();
      }
      case ObjTypeDto.Pdf: {
        return await new SyncPdfCommand(obj as ObjDto<ObjPdfDto>, tx).execute();
      }
      case ObjTypeDto.Note: {
        return await new SyncNoteCommand(obj as ObjDto<ObjNoteDto>, tx).execute();
      }
      case ObjTypeDto.PageNote: {
        return await new SyncPageNoteCommand(obj as ObjDto<ObjPageNoteDto>, tx).execute();
      }
      case ObjTypeDto.Removed: {
        return await new SyncRemovedCommand(obj as ObjDto<ObjRemovedDto>, tx).execute();
      }
      default: {
        fnConsoleLog('SyncObjectCommand->PROBLEM', obj, 'index', this.id);
        return SyncObjectStatus.SERVER_ERROR;
      }
    }
  };
}
