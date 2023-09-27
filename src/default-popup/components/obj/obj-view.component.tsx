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
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
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

class Store {
  static readonly limit = 15;
  static fetching = false;
  static hrefObjs: ObjDto<ObjPageDataDto>[] = [];
  static hrefIndex = 0;
  static originObjs: ObjDto<ObjPageDataDto>[] = [];
  static originIndex = 0;

  static resetStore() {
    this.hrefObjs = [];
    this.hrefIndex = 0;
    this.originObjs = [];
    this.originIndex = 0;
  }
}

const fetchObjects = async (idList: number[], type: 'href' | 'origin', href?: string): Promise<boolean> => {
  let index = type === 'origin' ? Store.originIndex : Store.hrefIndex;
  if (index >= idList.length) return false;
  const objs: ObjDto<ObjPageDataDto>[] = [];
  for (index; index < idList.length; index++) {
    if (objs.length === Store.limit) break;
    const obj = await new ObjGetCommand<ObjPageDataDto>(idList[index]).execute();
    // TODO check it - something is not deleting
    if (!obj) {
      LogManager.log(`PROBLEM ${index} ${idList[index]}`);
      continue;
    }
    if (hrefFilter(obj, href)) continue;
    objs.push(obj);
  }
  if (type === 'origin') {
    Store.originObjs.push(...objs);
    Store.originIndex = index;
  } else {
    Store.hrefObjs.push(...objs);
    Store.hrefIndex = index;
  }
  return true;
};

export const ObjViewComponent: FunctionComponent<Props> = (props) => {
  const [originObjs, setOriginObjs] = useState<ObjDto<ObjPageDataDto>[]>([]);
  const [hrefObjs, setHrefObjs] = useState<ObjDto<ObjPageDataDto>[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    setTimeout(async () => await initUrl(), 100);
    const urlKey = TinyDispatcher.getInstance().addListener(BusMessageType.POP_UPDATE_URL, () => {
      setTimeout(async () => {
        Store.resetStore();
        await initUrl();
      }, 100);
    });
    return () => {
      TinyDispatcher.getInstance().removeListener(BusMessageType.POP_UPDATE_URL, urlKey);
    };
  }, []);

  const initUrl = async () => {
    LogManager.log('initUrl');
    if (Store.fetching) return;
    if (!PopupActiveTabStore.url) return;
    Store.fetching = true;
    const hrefIds = await new ObjGetHrefCommand(PopupActiveTabStore.url).execute();
    const hasHref = await fetchObjects(hrefIds, 'href');
    if (hasHref) setHrefObjs(Store.hrefObjs.concat());
    const originIds = await new ObjGetOriginCommand(PopupActiveTabStore.url).execute();
    const hasOrigin = await fetchObjects(originIds, 'origin', PopupActiveTabStore.url.href);
    if (hasOrigin) setOriginObjs(Store.originObjs.concat());
    Store.fetching = false;
  };

  const handleScroll = () => {
    if (!ref.current) return;
    if (Store.fetching) return;
    const bottom = ref.current.scrollHeight - ref.current.clientHeight;
    if (bottom - ref.current.scrollTop > 10) return; // too much up
    setTimeout(async () => {
      await initUrl();
    }, 200);
  };
  return (
    <div
      ref={ref}
      style={{ maxHeight: '420px', display: 'flex', flexDirection: 'column', overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>On this page</div>
      <ObjListComponent objList={hrefObjs} editNoteCallback={props.editNoteCallback} />
      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>On {PopupActiveTabStore.url?.origin}</div>
      <ObjListComponent objList={originObjs} editNoteCallback={props.editNoteCallback} />
    </div>
  );
};
