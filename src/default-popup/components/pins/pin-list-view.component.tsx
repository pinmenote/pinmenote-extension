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
import React, { FunctionComponent } from 'react';
import { ObjDto } from '../../../common/model/obj/obj.dto';
import { ObjPagePinDto } from '../../../common/model/obj/obj-pin.dto';
import { PinListComponent } from './pin-list.component';
import { PopupActiveTabStore } from '../../store/popup-active-tab.store';
import Typography from '@mui/material/Typography';

interface PinListOriginProps {
  pinHref: ObjDto<ObjPagePinDto>[];
  pinOrigin: ObjDto<ObjPagePinDto>[];
}

export const PinListViewComponent: FunctionComponent<PinListOriginProps> = ({ pinHref, pinOrigin }) => {
  return (
    <div>
      <Typography fontWeight="bold" fontSize="14px">
        On this page
      </Typography>
      <PinListComponent pinList={pinHref} visibility={true} />
      <Typography fontWeight="bold" fontSize="14px">
        On {PopupActiveTabStore.url?.origin}
      </Typography>
      <PinListComponent pinList={pinOrigin} visibility={false} />
    </div>
  );
};
