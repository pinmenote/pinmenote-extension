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
import { ObjDto, ObjRemovedDto, ObjTypeDto } from '../../../../common/model/obj/obj.dto';
import { ObjNoteDto, ObjPageNoteDto } from '../../../../common/model/obj/obj-note.dto';
import { ICommand } from '../../../../common/model/shared/common.dto';
import { ObjDateIndex } from '../../../../common/command/obj/index/obj-update-index-add.command';
import { ObjGetCommand } from '../../../../common/command/obj/obj-get.command';
import { ObjPageDto } from '../../../../common/model/obj/obj-page.dto';
import { ObjPdfDto } from '../../../../common/model/obj/obj-pdf.dto';
import { ObjPinDto } from '../../../../common/model/obj/obj-pin.dto';
import { SyncNoteCommand } from './sync-note.command';
import { SyncPageNoteCommand } from './sync-page-note.command';
import { SyncPdfCommand } from './sync-pdf.command';
import { SyncPinCommand } from './sync-pin.command';
import { SyncProgress } from '../sync.model';
import { SyncRemovedCommand } from './sync-removed.command';
import { SyncSetProgressCommand } from '../progress/sync-set-progress.command';
import { SyncSnapshotCommand } from './sync-snapshot.command';
import { fnConsoleLog } from '../../../../common/fn/fn-console';
import { fnSleep } from '../../../../common/fn/fn-sleep';
import { BeginTxResponse } from '../../api/store/api-store.model';

export enum SyncObjectStatus {
  TX_LOCKED,
  SERVER_ERROR = -3,
  INDEX_NOT_EXISTS,
  OBJECT_NOT_EXISTS,
  OK,
  EMPTY_LIST,
  LAST_ELEMENT
}

export interface SyncIndex extends ObjDateIndex {
  status: SyncObjectStatus;
}

export class SyncIndexCommand implements ICommand<Promise<SyncObjectStatus>> {
  constructor(private progress: SyncProgress, private tx: BeginTxResponse, private index?: ObjDateIndex) {}

  async execute(): Promise<SyncObjectStatus> {
    if (!this.index) {
      fnConsoleLog('SyncObjectCommand->PROBLEM', this.index, this.progress);
      return SyncObjectStatus.INDEX_NOT_EXISTS;
    }
    const obj = await new ObjGetCommand(this.index.id).execute();
    if (!obj) {
      fnConsoleLog('SyncObjectCommand->syncObject EMPTY', this.index.id);
      return SyncObjectStatus.OBJECT_NOT_EXISTS;
    }
    switch (obj.type) {
      case ObjTypeDto.PageSnapshot:
      case ObjTypeDto.PageElementSnapshot: {
        return await new SyncSnapshotCommand(obj as ObjDto<ObjPageDto>, this.progress, this.tx).execute();
      }
      case ObjTypeDto.PageElementPin: {
        await new SyncPinCommand(obj as ObjDto<ObjPinDto>, this.progress, this.tx).execute();
        break;
      }
      case ObjTypeDto.Pdf: {
        await new SyncPdfCommand(obj as ObjDto<ObjPdfDto>, this.progress, this.tx).execute();
        break;
      }
      case ObjTypeDto.Note: {
        await new SyncNoteCommand(obj as ObjDto<ObjNoteDto>, this.progress, this.tx).execute();
        break;
      }
      case ObjTypeDto.PageNote: {
        await new SyncPageNoteCommand(obj as ObjDto<ObjPageNoteDto>, this.progress, this.tx).execute();
        break;
      }
      case ObjTypeDto.Removed: {
        await new SyncRemovedCommand(obj as ObjDto<ObjRemovedDto>, this.progress, this.tx).execute();
        break;
      }
      default: {
        fnConsoleLog('SyncObjectCommand->PROBLEM', obj.type, 'index', this.index);
        break;
      }
    }
    return SyncObjectStatus.SERVER_ERROR;
    /*await fnSleep(100);
    await new SyncSetProgressCommand({ id: this.index.id, timestamp: this.index.dt, state: 'update' }).execute();
    return SyncObjectStatus.OK;*/
  }
}
