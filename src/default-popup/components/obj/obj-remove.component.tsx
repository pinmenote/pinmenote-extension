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
import { ObjDto } from '../../../common/model/obj/obj.dto';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { ObjTitleFactory } from '../../../common/factory/obj-title.factory';

interface Props {
  obj?: ObjDto;
  removeCallback: (obj?: ObjDto) => Promise<void>;
}

export const ObjRemoveComponent: FunctionComponent<Props> = (props) => {
  const [isRemoving, setIsRemoving] = useState<boolean>(false);

  let title = '';
  if (props.obj) title = ObjTitleFactory.computeTitle(props.obj);

  const handleRemove = async () => {
    setIsRemoving(true);
    await props.removeCallback(props.obj);
    setIsRemoving(false);
  };
  return (
    <div style={{ display: 'flex' }}>
      <div
        style={{
          width: 300,
          backgroundColor: '#fff',
          display: isRemoving ? 'flex' : 'none',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress />
      </div>
      <div
        style={{
          backgroundColor: '#fff',
          display: isRemoving ? 'none' : 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography textAlign="center">Are you sure you want to remove &apos;{title}&apos; ?</Typography>
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', width: 200 }}>
          <Button variant="outlined" onClick={handleRemove}>
            YES
          </Button>
          <Button variant="outlined" onClick={() => props.removeCallback()}>
            NO
          </Button>
        </div>
      </div>
    </div>
  );
};
