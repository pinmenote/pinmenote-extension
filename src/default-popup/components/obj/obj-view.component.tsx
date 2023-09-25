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
import { BusMessageType } from '../../../common/model/bus.model';
import { ObjGetHrefCommand } from '../../../common/command/obj/url/obj-get-href.command';
import { ObjGetOriginCommand } from '../../../common/command/obj/url/obj-get-origin.command';
import { ObjListComponent } from './obj-list.component';
import { ObjPageNoteDto } from '../../../common/model/obj/obj-note.dto';
import { PopupActiveTabStore } from '../../store/popup-active-tab.store';
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';
import { LogManager } from '../../../common/popup/log.manager';
import { ObjPageDto } from '../../../common/model/obj/obj-page.dto';
import { ObjPinDto } from '../../../common/model/obj/obj-pin.dto';
import { ObjPdfDto } from '../../../common/model/obj/obj-pdf.dto';
import { ObjGetCommand } from '../../../common/command/obj/obj-get.command';

interface Props {
  editNoteCallback: (obj: ObjDto<ObjPageNoteDto>) => void;
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
  if (index >= idList.length) return { objs: [], index };
  const objs: ObjDto<ObjPageDataDto>[] = [];
  for (index; index < idList.length; index++) {
    const obj = await new ObjGetCommand<ObjPageDataDto>(idList[index]).execute();
    if (hrefFilter(obj, href)) continue;
    objs.push(obj);
  }
  return { objs, index };
};

export const ObjViewComponent: FunctionComponent<Props> = (props) => {
  const [originObjs, setOriginObjs] = useState<ObjDto<ObjPageDataDto>[]>([]);
  const [hrefObjs, setHrefObjs] = useState<ObjDto<ObjPageDataDto>[]>([]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    setTimeout(async () => await initUrl(), 100);
    const urlKey = TinyDispatcher.getInstance().addListener(BusMessageType.POP_UPDATE_URL, () => {
      setTimeout(async () => await initUrl(), 100);
    });
    return () => {
      TinyDispatcher.getInstance().removeListener(BusMessageType.POP_UPDATE_URL, urlKey);
    };
  }, [props]);

  const initUrl = async () => {
    LogManager.log('initUrl');
    if (!PopupActiveTabStore.url) return;
    const hrefIds = await new ObjGetHrefCommand(PopupActiveTabStore.url).execute();
    const href = await fetchObjects(hrefIds, 0);
    setHrefObjs(href.objs);
    const originIds = await new ObjGetOriginCommand(PopupActiveTabStore.url).execute();
    const origin = await fetchObjects(originIds, 0, PopupActiveTabStore.url.href);
    setOriginObjs(origin.objs);
  };
  return (
    <div style={{ maxHeight: '420px', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>On this page</div>
      <ObjListComponent objList={hrefObjs} editNoteCallback={props.editNoteCallback} />
      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>On {PopupActiveTabStore.url?.origin}</div>
      <ObjListComponent objList={originObjs} editNoteCallback={props.editNoteCallback} />
    </div>
  );
};
