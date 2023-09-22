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
import React, { FunctionComponent, useEffect, useState } from 'react';
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
import { ObjGetCommand } from '../../../common/command/obj/obj-get.command';

interface Props {
  editNoteCallback: (obj: ObjDto<ObjPageNoteDto>) => void;
  idList: number[];
  href?: string;
}

interface FetchObjectsResult {
  objs: ObjDto<ObjPageDataDto>[];
  index: number;
}

const hrefFilter = (obj: ObjDto<ObjPageDataDto>, href?: string) => {
  if ([ObjTypeDto.PageSnapshot, ObjTypeDto.PageElementSnapshot].includes(obj.type)) {
    if ((obj.data as ObjPageDto).snapshot.info.url.href === href) return true;
  } else if (obj.type === ObjTypeDto.PageElementPin) {
    if ((obj.data as ObjPinDto).data.url.href === href) return true;
  } else if (obj.type === ObjTypeDto.PageNote) {
    if ((obj.data as ObjPageNoteDto).url.href === href) return true;
  } else if (obj.type === ObjTypeDto.Pdf) {
    if ((obj.data as ObjPdfDto).data.rawUrl === href) return true;
  }
  return false;
};

const fetchObjects = async (idList: number[], index: number, href?: string): Promise<FetchObjectsResult> => {
  LogManager.log(`aaa ${href || 'undefined'} bbb ${idList.length} ccc ${index}`);
  if (index >= idList.length) return { objs: [], index };
  const objs: ObjDto<ObjPageDataDto>[] = [];
  for (index; index < idList.length; index++) {
    const obj = await new ObjGetCommand<ObjPageDataDto>(idList[index]).execute();
    if (hrefFilter(obj, href)) continue;
    objs.push(obj);
  }
  return { objs, index };
};

export const ObjListComponent: FunctionComponent<Props> = (props) => {
  const [objList, setObjList] = useState<ObjDto<ObjPageDataDto>[]>([]);
  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    refetch();
  }, [props]);

  const refetch = () => {
    fetchObjects(props.idList, index, props.href)
      .then((data) => {
        setObjList(data.objs);
        setIndex(data.index);
      })
      .catch(() => LogManager.log('error'));
  };

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
    for (let i = 0; i < props.idList.length; i++) {
      if (props.idList[i] === id) {
        props.idList.splice(i, 1);
        refetch();
        break;
      }
    }
  };

  // Render pins
  const components: React.ReactNode[] = [];
  for (const obj of objList) {
    switch (obj.type) {
      case ObjTypeDto.PageElementPin:
        components.push(
          <PinListElement key={obj.id} obj={obj as ObjDto<ObjPinDto>} removeCallback={handlePinRemove} />
        );
        break;
      case ObjTypeDto.PageElementSnapshot:
      case ObjTypeDto.PageSnapshot:
        components.push(
          <SnapshotListElement key={obj.id} obj={obj as ObjDto<ObjPageDto>} removeCallback={handleSnapshotRemove} />
        );
        break;
      case ObjTypeDto.PageNote:
        components.push(
          <NoteListElementComponent
            editCallback={props.editNoteCallback}
            obj={obj as ObjDto<ObjPageNoteDto>}
            removeCallback={handleNoteRemove}
          />
        );
        break;
      case ObjTypeDto.Pdf:
        components.push(<PdfListElementComponent obj={obj as ObjDto<ObjPdfDto>} removeCallback={handlePdfRemove} />);
        break;
      default: {
        LogManager.log(`UNSUPPORTED ${obj.type}`);
      }
    }
  }
  // TODO add scroll handler
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div>{components}</div>
    </div>
  );
};
