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
import React, { FunctionComponent, useEffect, useRef } from 'react';
import { PageComputeMessage, ContentProgressMessage } from '@pinmenote/page-compute';
import { BrowserApi } from '@pinmenote/browser-api';
import { BusMessageType } from '../../../common/model/bus.model';
import { MainViewEnum } from '../component-model';
import { PopupActiveTabStore } from '../../store/popup-active-tab.store';
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';
import Typography from '@mui/material/Typography';

interface Props {
  closeListCallback: (viewType: MainViewEnum) => void;
}

export const SavePageProgressComponent: FunctionComponent<Props> = (props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const dispatcher = TinyDispatcher.getInstance();
    dispatcher.addListener<string>(
      BusMessageType.POPUP_PAGE_SNAPSHOT_ADD,
      () => {
        setTimeout(() => {
          props.closeListCallback(MainViewEnum.PAGE_OBJECTS);
          TinyDispatcher.getInstance().dispatch(BusMessageType.POP_IS_ADDING, false);
        }, 1);
      },
      true
    );
    const saveKey = dispatcher.addListener<ContentProgressMessage>(
      PageComputeMessage.CONTENT_SAVE_PROGRESS,
      (event, key, value) => {
        if (!ref.current) return;
        const p = document.createElement('p');
        p.style.margin = '0';
        p.style.padding = '0';
        p.innerHTML = `${value.msg}`;
        if (value.img) {
          const img = document.createElement('img');
          img.src = value.img;
          img.style.maxWidth = '280px';
          ref.current.insertBefore(img, ref.current.firstChild);
        }
        if (value.url) {
          const a = document.createElement('a');
          a.href = value.url;
          a.style.color = '#000';
        }
        ref.current.insertBefore(p, ref.current.firstChild);
      }
    );
    BrowserApi.sendTabMessage({ type: BusMessageType.POPUP_PAGE_SNAPSHOT_ADD, data: PopupActiveTabStore.url }).catch(
      () => {
        /* IGNORE */
      }
    );
    return () => {
      dispatcher.removeListener(PageComputeMessage.CONTENT_SAVE_PROGRESS, saveKey);
    };
  });
  return (
    <div>
      <Typography>Saving page progress</Typography>
      <div ref={ref} style={{ overflow: 'auto', height: 400 }}></div>
    </div>
  );
};
