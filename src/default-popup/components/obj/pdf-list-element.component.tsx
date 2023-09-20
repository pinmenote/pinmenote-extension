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
import React, { FunctionComponent, useState } from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { BrowserApi } from '@pinmenote/browser-api';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { ObjDto } from '../../../common/model/obj/obj.dto';
import { ObjPdfDto } from '../../../common/model/obj/obj-pdf.dto';
import { PdfListExpandComponent } from './pdf-list-expand.component';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { PopupActiveTabStore } from '../../store/popup-active-tab.store';
import Typography from '@mui/material/Typography';

interface Props {
  obj: ObjDto<ObjPdfDto>;
  removeCallback: (pin: ObjDto<ObjPdfDto>) => void;
}

export const PdfListElementComponent: FunctionComponent<Props> = (props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleNavigate = async (data: ObjDto<ObjPdfDto>): Promise<void> => {
    if (PopupActiveTabStore.url?.href !== data.data.data.url.href) {
      await BrowserApi.setActiveTabUrl(data.data.data.url.href);
      window.close();
    }
  };

  const handlePinRemove = (data: ObjDto<ObjPdfDto>): void => {
    props.removeCallback(data);
  };

  const handlePopover = (): void => {
    setIsExpanded(!isExpanded);
  };

  const expandIcon = isExpanded ? (
    <ExpandMoreIcon sx={{ fontSize: '12px' }} />
  ) : (
    <NavigateNextIcon sx={{ fontSize: '12px' }} />
  );
  const expandComponent = isExpanded ? <PdfListExpandComponent obj={props.obj}></PdfListExpandComponent> : '';

  const a = props.obj.data.data.url.pathname.split('/');
  let title = a[a.length - 1];
  title = title.length > 30 ? `${title.substring(0, 30)}...` : title;

  return (
    <div style={{ width: '100%', marginBottom: 15 }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <div style={{ color: '#777777' }}>
            <PictureAsPdfIcon />
          </div>
          <IconButton size="small" onClick={handlePopover}>
            {expandIcon}
          </IconButton>
          <Typography style={{ cursor: 'pointer', userSelect: 'none', fontSize: '12px' }} onClick={handlePopover}>
            {title}
          </Typography>
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
          <IconButton title="Go to page" size="small" onClick={() => handleNavigate(props.obj)}>
            <ArrowForwardIcon sx={{ fontSize: '12px' }} />
          </IconButton>
          <IconButton title="Remove pin" size="small" onClick={() => handlePinRemove(props.obj)}>
            <DeleteIcon sx={{ fontSize: '12px' }} />
          </IconButton>
        </div>
      </div>
      {expandComponent}
    </div>
  );
};
