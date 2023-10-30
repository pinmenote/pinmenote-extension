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
import React, { ChangeEvent, FunctionComponent, useState } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import RestoreIcon from '@mui/icons-material/Restore';
import IconButton from '@mui/material/IconButton';
import { StyledInput } from '../../../../common/components/react/styled.input';
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { ObjTitleFactory } from '../../../../common/factory/obj-title.factory';

interface Props {
  obj: ObjDto;
  saveCallback: (title: string) => void;
  cancelCallback: () => void;
  restoreCallback: () => void;
}

export const BoardItemTitleEdit: FunctionComponent<Props> = (props) => {
  const titleData = ObjTitleFactory.computeTitleSize(props.obj, 50);
  const [newTitle, setNewTitle] = useState<string>(titleData.title);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setNewTitle(e.target.value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
      <div
        style={{
          border: '1px solid #000',
          borderRadius: 5,
          width: '100%',
          alignItems: 'center',
          display: 'flex',
          paddingLeft: 5,
          paddingRight: 5
        }}
      >
        <StyledInput onChange={handleChange} value={newTitle} size="small" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <IconButton onClick={() => props.saveCallback(newTitle)}>
          <SaveIcon />
        </IconButton>
        <IconButton title="Restore original" onClick={() => props.restoreCallback()}>
          <RestoreIcon />
        </IconButton>
        <IconButton title="Cancel" onClick={() => props.cancelCallback()}>
          <CloseIcon />
        </IconButton>
      </div>
    </div>
  );
};
