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
import { ObjDto, ObjTypeDto } from '../../../common/model/obj/obj.dto';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { ObjPdfDto } from '../../../common/model/obj/obj-pdf.dto';
import { ObjPageDto } from '../../../common/model/obj/obj-page.dto';
import { ObjPageNoteDto } from '../../../common/model/obj/obj-note.dto';
import { ObjPinDto } from '../../../common/model/obj/obj-pin.dto';

interface Props {
  obj?: ObjDto;
  removeCallback: (obj?: ObjDto) => void;
}

export const ObjRemoveComponent: FunctionComponent<Props> = (props) => {
  let title = '';
  if (props.obj) {
    switch (props.obj.type) {
      case ObjTypeDto.Pdf: {
        const obj = props.obj as ObjDto<ObjPdfDto>;
        const a = obj.data.data.url.pathname.split('/');
        title = `PDF ${a[a.length - 1]}`;
        break;
      }
      case ObjTypeDto.PageSnapshot:
      case ObjTypeDto.PageElementSnapshot: {
        const obj = props.obj as ObjDto<ObjPageDto>;
        title = obj.data.snapshot.info.title;
        break;
      }
      case ObjTypeDto.PageNote: {
        const obj = props.obj as ObjDto<ObjPageNoteDto>;
        title = obj.data.data.title;
        break;
      }
      case ObjTypeDto.PageElementPin: {
        const obj = props.obj as ObjDto<ObjPinDto>;
        title = obj.data.description.title;
        break;
      }
    }
  }
  return (
    <div
      style={{
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Typography textAlign="center">Are you sure you want to remove &apos;{title}&apos; ?</Typography>
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', width: 200 }}>
        <Button variant="outlined" onClick={() => props.removeCallback(props.obj)}>
          YES
        </Button>
        <Button variant="outlined" onClick={() => props.removeCallback()}>
          NO
        </Button>
      </div>
    </div>
  );
};
