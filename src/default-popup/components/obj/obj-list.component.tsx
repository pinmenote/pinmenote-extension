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
import { ObjDto, ObjPageDataDto, ObjTypeDto } from '../../../common/model/obj/obj.dto';
import React, { FunctionComponent, useState } from 'react';
import { BrowserApi } from '@pinmenote/browser-api';
import { BusMessageType } from '../../../common/model/bus.model';
import { LogManager } from '../../../common/popup/log.manager';
import { NoteListElementComponent } from './note-list-element.component';
import { ObjPageDto } from '../../../common/model/obj/obj-page.dto';
import { ObjPageNoteDto } from '../../../common/model/obj/obj-note.dto';
import { ObjPdfDto } from '../../../common/model/obj/obj-pdf.dto';
import { ObjPinDto } from '../../../common/model/obj/obj-pin.dto';
import { PageNoteRemoveCommand } from '../../../common/command/page-note/page-note-remove.command';
import { PageSnapshotRemoveCommand } from '../../../common/command/snapshot/page-snapshot-remove.command';
import { PdfListElementComponent } from './pdf-list-element.component';
import { PdfRemoveCommand } from '../../../common/command/pdf/pdf-remove.command';
import { PinListElement } from './pin-list-element.component';
import { PinRemoveCommand } from '../../../common/command/pin/pin-remove.command';
import { SnapshotListElement } from './snapshot-list-element.component';

interface Props {
  editNoteCallback: (obj: ObjDto<ObjPageNoteDto>) => void;
  objList: ObjDto<ObjPageDataDto>[];
}

export const ObjListComponent: FunctionComponent<Props> = (props) => {
  LogManager.log(`RENDER !!! ${props.objList.length}`);
  const [reRender, setReRender] = useState(false);

  const handlePinRemove = async (data: ObjDto<ObjPinDto>) => {
    await new PinRemoveCommand(data.id, data.data.data.url, data.data.data.iframe).execute();
    await BrowserApi.sendTabMessage<number>({ type: BusMessageType.CONTENT_PIN_REMOVE, data: data.id });
    handleRemove(data.id);
  };

  const handleSnapshotRemove = async (data: ObjDto<ObjPageDto>) => {
    await new PageSnapshotRemoveCommand(data).execute();
    handleRemove(data.id);
  };

  const handleNoteRemove = async (data: ObjDto<ObjPageNoteDto>) => {
    await new PageNoteRemoveCommand(data).execute();
    handleRemove(data.id);
  };

  const handlePdfRemove = async (data: ObjDto<ObjPdfDto>) => {
    await new PdfRemoveCommand(data.id, data.data).execute();
    handleRemove(data.id);
  };

  const handleRemove = (id: number) => {
    for (let i = 0; i < props.objList.length; i++) {
      const obj = props.objList[i];
      if (obj.id === id) {
        props.objList.splice(i, 1);
        setReRender(!reRender);
        break;
      }
    }
  };

  // Render pins
  const objs: React.ReactNode[] = [];
  // Workaround for duplicated objects
  const s = new Set<number>();
  for (const obj of props.objList) {
    if (s.has(obj.id)) continue;
    s.add(obj.id);
    switch (obj.type) {
      case ObjTypeDto.PageElementPin:
        objs.push(<PinListElement key={obj.id} obj={obj as ObjDto<ObjPinDto>} removeCallback={handlePinRemove} />);
        break;
      case ObjTypeDto.PageElementSnapshot:
      case ObjTypeDto.PageSnapshot:
        objs.push(
          <SnapshotListElement key={obj.id} obj={obj as ObjDto<ObjPageDto>} removeCallback={handleSnapshotRemove} />
        );
        break;
      case ObjTypeDto.PageNote:
        objs.push(
          <NoteListElementComponent
            editCallback={props.editNoteCallback}
            obj={obj as ObjDto<ObjPageNoteDto>}
            removeCallback={handleNoteRemove}
          />
        );
        break;
      case ObjTypeDto.Pdf:
        objs.push(<PdfListElementComponent obj={obj as ObjDto<ObjPdfDto>} removeCallback={handlePdfRemove} />);
        break;
      default: {
        LogManager.log(`UNSUPPORTED ${obj.type}`);
      }
    }
  }
  return (
    <div style={{ width: '100%' }}>
      <div style={{ width: '100%' }}>{objs}</div>
    </div>
  );
};
