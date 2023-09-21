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
import { ObjDto, ObjRemovedDto, ObjTypeDto } from '../../../common/model/obj/obj.dto';
import { ObjNoteDto, ObjPageNoteDto } from '../../../common/model/obj/obj-note.dto';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjDateIndex } from '../../../common/command/obj/index/obj-update-index-add.command';
import { ObjGetCommand } from '../../../common/command/obj/obj-get.command';
import { ObjPageDto } from '../../../common/model/obj/obj-page.dto';
import { ObjPdfDto } from '../../../common/model/obj/obj-pdf.dto';
import { ObjPinDto } from '../../../common/model/obj/obj-pin.dto';
import { SyncNoteCommand } from './obj/sync-note.command';
import { SyncPageNoteCommand } from './obj/sync-page-note.command';
import { SyncPdfCommand } from './obj/sync-pdf.command';
import { SyncPinCommand } from './obj/sync-pin.command';
import { SyncObjectStatus, SyncProgress } from './sync.model';
import { SyncRemovedCommand } from './obj/sync-removed.command';
import { SyncSnapshotCommand } from './obj/sync-snapshot.command';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { fnSleep } from '../../../common/fn/fn-sleep';
import { BeginTxResponse } from '../api/store/api-store.model';

export interface SyncIndex extends ObjDateIndex {
  status: SyncObjectStatus;
}

export class SyncIndexCommand implements ICommand<Promise<SyncObjectStatus>> {
  constructor(private progress: SyncProgress, private tx: BeginTxResponse, private id: number) {}

  async execute(): Promise<SyncObjectStatus> {
    const obj = await new ObjGetCommand(this.id).execute();
    if (!obj) {
      fnConsoleLog('SyncObjectCommand->syncObject EMPTY', this.id);
      return SyncObjectStatus.OBJECT_NOT_EXISTS;
    }
    let status = SyncObjectStatus.OK;
    // Skip for now for those with index
    if (obj.server?.id) return status;

    switch (obj.type) {
      case ObjTypeDto.PageSnapshot:
      case ObjTypeDto.PageElementSnapshot: {
        status = await new SyncSnapshotCommand(obj as ObjDto<ObjPageDto>, this.tx).execute();
        break;
      }
      case ObjTypeDto.PageElementPin: {
        status = await new SyncPinCommand(obj as ObjDto<ObjPinDto>, this.tx).execute();
        break;
      }
      case ObjTypeDto.Pdf: {
        status = await new SyncPdfCommand(obj as ObjDto<ObjPdfDto>, this.tx).execute();
        break;
      }
      case ObjTypeDto.Note: {
        status = await new SyncNoteCommand(obj as ObjDto<ObjNoteDto>, this.tx).execute();
        break;
      }
      case ObjTypeDto.PageNote: {
        status = await new SyncPageNoteCommand(obj as ObjDto<ObjPageNoteDto>, this.tx).execute();
        break;
      }
      case ObjTypeDto.Removed: {
        await new SyncRemovedCommand(obj as ObjDto<ObjRemovedDto>, this.tx).execute();
        break;
      }
      default: {
        fnConsoleLog('SyncObjectCommand->PROBLEM', obj, 'index', this.id);
        break;
      }
    }
    if (status < 0) return status;
    await fnSleep(100);
    return status;
  }
}
