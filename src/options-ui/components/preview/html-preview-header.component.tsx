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
import { BrowserApi } from '@pinmenote/browser-api';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import ClearIcon from '@mui/icons-material/Clear';
import { ObjDto } from '../../../common/model/obj/obj.dto';
import { ObjPageDto } from '../../../common/model/obj/obj-page.dto';
import { PageSnapshotDto } from '../../../common/model/obj/page-snapshot.dto';
import dayjs from 'dayjs';
import { DATE_YEAR_SECOND } from '../../../common/date-format.constraints';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import { BusMessageType } from '../../../common/model/bus.model';
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';
import { SyncObjectStatus } from '../../../common/model/sync.model';
import { fnConsoleLog } from '../../../common/fn/fn-console';

export interface Props {
  obj?: ObjDto<ObjPageDto>;
  isLoading: boolean;
  handleDownload: () => void;
  handleClose: () => void;
}

export const HtmlPreviewHeaderComponent: FunctionComponent<Props> = (props) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const urlRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!titleRef.current) return;
    if (!urlRef.current) return;
    if (props.obj) renderHeader(props.obj);
    const dispatcher = TinyDispatcher.getInstance();
    const syncKey = dispatcher.addListener<SyncObjectStatus>(
      BusMessageType.OPTIONS_SYNC_OUTGOING_OBJECT,
      (event, key, value) => {
        fnConsoleLog('HtmlPreviewHeaderComponent->SYNC !!!!!!!', event, key, value);
      },
      true
    );
    return () => {
      dispatcher.removeListener(BusMessageType.OPTIONS_SYNC_OUTGOING_OBJECT, syncKey);
    };
  }, [props]);

  const renderHeader = (obj: ObjDto<ObjPageDto>): void => {
    const snapshot: PageSnapshotDto = obj.data.snapshot;
    if (titleRef.current) {
      titleRef.current.innerHTML = snapshot.info.title;
    }
    if (urlRef.current) {
      urlRef.current.innerHTML = `
    <a href="${snapshot.info.url.href}" target="_blank" style="word-break: break-all">
        ${snapshot.info.url.href}
    </a><span style="margin-left: 10px;">Created At : ${dayjs(obj.createdAt).format(DATE_YEAR_SECOND)}</span>`;
    }
  };

  const handleManualSync = async () => {
    await BrowserApi.sendRuntimeMessage({ type: BusMessageType.OPTIONS_SYNC_OUTGOING_OBJECT, data: props.obj?.id });
  };

  return (
    <div style={{ backgroundColor: '#ffffff', width: '100%', display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ marginLeft: '10px', marginBottom: '5px' }}>
        <h2 style={{ marginTop: '5px', marginBottom: '5px' }} ref={titleRef}></h2>
        <div ref={urlRef}></div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ display: props.isLoading ? 'flex' : 'none' }}>
          <CircularProgress />
        </div>
        <IconButton onClick={handleManualSync}>
          <CloudSyncIcon />
        </IconButton>
        <IconButton onClick={props.handleDownload}>
          <DownloadIcon />
        </IconButton>
        <IconButton onClick={props.handleClose}>
          <ClearIcon />
        </IconButton>
      </div>
    </div>
  );
};
