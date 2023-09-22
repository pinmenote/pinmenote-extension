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
import { ObjDto, ObjTypeDto } from '../../../common/model/obj/obj.dto';
import React, { FunctionComponent, useState } from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { BrowserApi } from '@pinmenote/browser-api';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { ObjPageDto } from '../../../common/model/obj/obj-page.dto';
import { PopupActiveTabStore } from '../../store/popup-active-tab.store';
import PushPinIcon from '@mui/icons-material/PushPin';
import { SaveElementIcon } from '../../../common/components/react/save-element.icon';
import { SnapshotListExpandComponent } from './snapshot-list-expand.component';
import Typography from '@mui/material/Typography';
import { WebOutlined } from '@mui/icons-material';

interface SnapshotListElementProps {
  obj: ObjDto<ObjPageDto>;
  removeCallback: (obj: ObjDto<ObjPageDto>) => void;
}

export const SnapshotListElement: FunctionComponent<SnapshotListElementProps> = (props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleNavigate = async (data: ObjDto<ObjPageDto>): Promise<void> => {
    if (PopupActiveTabStore.url?.href !== data.data.snapshot.info.url.href) {
      await BrowserApi.setActiveTabUrl(data.data.snapshot.info.url.href);
      window.close();
    }
  };

  const handleObjRemove = (data: ObjDto<ObjPageDto>): void => {
    props.removeCallback(data);
  };

  const handlePopover = (): void => {
    setIsExpanded(!isExpanded);
  };

  const handleOpenPage = (data: ObjDto<ObjPageDto>): void => {
    if (BrowserApi.isChrome) {
      BrowserApi.openOptionsPage(`#obj/${data.id}`);
    } else {
      // TODO change to BrowserApi 0.0.5
      window.open(`${browser.runtime.getManifest().options_ui?.page || ''}#obj/${data.id}`);
      window.close();
    }
  };

  const expandIcon = isExpanded ? (
    <ExpandMoreIcon sx={{ fontSize: '12px' }} />
  ) : (
    <NavigateNextIcon sx={{ fontSize: '12px' }} />
  );
  const expandComponent = isExpanded ? <SnapshotListExpandComponent obj={props.obj} /> : '';

  const value = props.obj.data.snapshot.info.title;
  const title = value.length > 30 ? `${value.substring(0, 30)}...` : value;

  return (
    <div key={props.obj.id} style={{ width: '100%', marginBottom: 15 }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }} onClick={handlePopover}>
          <div style={{ color: '#777777' }}>
            {props.obj.type === ObjTypeDto.PageElementSnapshot ? (
              <SaveElementIcon />
            ) : (
              <WebOutlined sx={{ fontSize: '16px' }} />
            )}
          </div>
          <IconButton size="small">{expandIcon}</IconButton>
          <Typography style={{ cursor: 'pointer', userSelect: 'none', fontSize: '12px' }}>{title}</Typography>
        </div>
        <div
          style={{
            textAlign: 'right',
            marginRight: 10,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end'
          }}
        >
          <IconButton title="Show on pin board" size="small" onClick={() => handleOpenPage(props.obj)}>
            <PushPinIcon sx={{ fontSize: '12px' }} />
          </IconButton>
          <IconButton title="Go to page" size="small" onClick={() => handleNavigate(props.obj)}>
            <ArrowForwardIcon sx={{ fontSize: '12px' }} />
          </IconButton>
          <IconButton title="Remove obj" size="small" onClick={() => handleObjRemove(props.obj)}>
            <DeleteIcon sx={{ fontSize: '12px' }} />
          </IconButton>
        </div>
      </div>
      {expandComponent}
    </div>
  );
};
