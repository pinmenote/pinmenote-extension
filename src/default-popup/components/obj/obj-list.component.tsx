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
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { NoteListElementComponent } from './note-list-element.component';
import { NoteRemoveCommand } from '../../../common/command/note/note-remove.command';
import { ObjNoteDto } from '../../../common/model/obj/obj-note.dto';
import { ObjPageDto } from '../../../common/model/obj/obj-page.dto';
import { ObjPinDto } from '../../../common/model/obj/obj-pin.dto';
import { PageSnapshotRemoveCommand } from '../../../common/command/snapshot/page-snapshot-remove.command';
import { PinListElement } from './pin-list-element.component';
import { PinRemoveCommand } from '../../../common/command/pin/pin-remove.command';
import { SnapshotListElement } from './snapshot-list-element.component';

interface ObjListComponentProps {
  editNoteCallback: (obj: ObjDto<ObjNoteDto>) => void;
  objList: ObjDto<ObjPageDataDto>[];
}

export const ObjListComponent: FunctionComponent<ObjListComponentProps> = (props) => {
  const [reRender, setReRender] = useState(false);

  const handlePinRemove = async (data: ObjDto<ObjPinDto>) => {
    await new PinRemoveCommand(data.id, data.data.url, data.data.iframe).execute();
    await BrowserApi.sendTabMessage<number>({ type: BusMessageType.CONTENT_PIN_REMOVE, data: data.id });
    handleRemove(data.id);
  };

  const handleSnapshotRemove = async (data: ObjDto<ObjPageDto>) => {
    await new PageSnapshotRemoveCommand(data).execute();
    handleRemove(data.id);
  };

  const handleNoteRemove = async (data: ObjDto<ObjNoteDto>) => {
    await new NoteRemoveCommand(data).execute();
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
  for (const obj of props.objList) {
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
            obj={obj as ObjDto<ObjNoteDto>}
            removeCallback={handleNoteRemove}
          />
        );
        break;
    }
  }
  return (
    <div style={{ width: '100%' }}>
      <div style={{ width: '100%' }}>{objs}</div>
    </div>
  );
};
