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
import { ObjDto, ObjTypeDto } from '../../../../common/model/obj/obj.dto';
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
import { SyncSetProgressCommand } from '../progress/sync-set-progress.command';
import { SyncSnapshotCommand } from './sync-snapshot.command';
import { fnConsoleLog } from '../../../../common/fn/fn-console';
import { fnSleep } from '../../../../common/fn/fn-sleep';

export class SyncObjectCommand implements ICommand<Promise<void>> {
  constructor(private progress: SyncProgress, private index?: ObjDateIndex) {}

  async execute(): Promise<void> {
    if (!this.index) {
      fnConsoleLog('SyncObjectCommand->PROBLEM', this.index, this.progress);
      return;
    }
    const obj = await new ObjGetCommand(this.index.id).execute();
    if (!obj) {
      fnConsoleLog('SyncObjectCommand->syncObject EMPTY', this.index.id);
      return;
    }
    switch (obj.type) {
      case ObjTypeDto.PageSnapshot:
      case ObjTypeDto.PageElementSnapshot: {
        await new SyncSnapshotCommand(obj as ObjDto<ObjPageDto>, this.progress, this.index).execute();
        break;
      }
      case ObjTypeDto.PageElementPin: {
        fnConsoleLog('SyncObjectCommand', obj.type, obj.id, 'index', this.index, 'obj', obj);
        await new SyncPinCommand(obj as ObjDto<ObjPinDto>, this.progress, this.index).execute();
        break;
      }
      case ObjTypeDto.Pdf: {
        fnConsoleLog('SyncObjectCommand', obj.type, obj.id, 'index', this.index, 'obj', obj);
        await new SyncPdfCommand(obj as ObjDto<ObjPdfDto>, this.progress, this.index).execute();
        break;
      }
      case ObjTypeDto.Note: {
        fnConsoleLog('SyncObjectCommand', obj.type, obj.id, 'index', this.index, 'obj', obj);
        await new SyncNoteCommand(obj as ObjDto<ObjNoteDto>, this.progress, this.index).execute();
        break;
      }
      case ObjTypeDto.PageNote: {
        fnConsoleLog('SyncObjectCommand', obj.type, obj.id, 'index', this.index, 'obj', obj);
        await new SyncPageNoteCommand(obj as ObjDto<ObjPageNoteDto>, this.progress, this.index).execute();
        break;
      }
      default: {
        fnConsoleLog('SyncObjectCommand->PROBLEM', obj.type, 'index', this.index);
        break;
      }
    }
    await fnSleep(100);
    await new SyncSetProgressCommand({ id: this.index.id, timestamp: this.index.dt, state: 'update' }).execute();
  }
}
