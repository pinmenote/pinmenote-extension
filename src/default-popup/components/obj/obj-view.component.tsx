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
import { ObjDto } from '../../../common/model/obj/obj.dto';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { BusMessageType } from '../../../common/model/bus.model';
import { ObjGetHrefCommand } from '../../../common/command/obj/url/obj-get-href.command';
import { ObjGetOriginCommand } from '../../../common/command/obj/url/obj-get-origin.command';
import { ObjListComponent } from './obj-list.component';
import { ObjPageNoteDto } from '../../../common/model/obj/obj-note.dto';
import { PopupActiveTabStore } from '../../store/popup-active-tab.store';
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';
import Typography from '@mui/material/Typography';

interface Props {
  editNoteCallback: (obj: ObjDto<ObjPageNoteDto>) => void;
}

export const ObjViewComponent: FunctionComponent<Props> = (props) => {
  const [originIds, setOriginIds] = useState<number[]>([]);
  const [hrefIds, setHrefIds] = useState<number[]>([]);
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    setTimeout(async () => await initUrl(), 100);
    const urlKey = TinyDispatcher.getInstance().addListener(BusMessageType.POP_UPDATE_URL, () => {
      setTimeout(async () => await initUrl(), 100);
    });
    return () => {
      TinyDispatcher.getInstance().removeListener(BusMessageType.POP_UPDATE_URL, urlKey);
    };
  }, []);

  const initUrl = async () => {
    if (initialized) return;
    if (!PopupActiveTabStore.url) return;
    setInitialized(true);
    const href = await new ObjGetHrefCommand(PopupActiveTabStore.url).execute();
    const origin = await new ObjGetOriginCommand(PopupActiveTabStore.url).execute();
    setHrefIds(href);
    setOriginIds(origin);
  };
  return (
    <div style={{ overflow: 'hidden' }}>
      <Typography fontWeight="bold" fontSize="14px">
        On this page
      </Typography>
      <ObjListComponent idList={hrefIds} editNoteCallback={props.editNoteCallback} />
      <Typography fontWeight="bold" fontSize="14px">
        On {PopupActiveTabStore.url?.origin}
      </Typography>
      <ObjListComponent
        idList={originIds}
        href={PopupActiveTabStore.url?.href}
        editNoteCallback={props.editNoteCallback}
      />
    </div>
  );
};
