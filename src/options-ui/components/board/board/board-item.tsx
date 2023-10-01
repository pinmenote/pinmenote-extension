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
import { BoardItemRemove } from './board-item-remove';
import { ObjDto } from '../../../../common/model/obj/obj.dto';

interface Props extends React.PropsWithChildren {
  obj?: ObjDto;
  handleRemove: (obj?: ObjDto) => void;
}

export const BoardItem: FunctionComponent<Props> = (props) => {
  return (
    <div>
      <div
        style={{
          display: props.obj ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          width: 380,
          height: 380,
          padding: 5,
          zIndex: 1000
        }}
      >
        <BoardItemRemove obj={props.obj} removeCallback={props.handleRemove} />
      </div>
      <div
        style={{
          display: props.obj ? 'none' : 'flex',
          flexDirection: 'column',
          maxWidth: 380,
          minWidth: 380,
          maxHeight: 580,
          border: '1px solid #eeeeee',
          padding: 5
        }}
      >
        {props.children}
      </div>
    </div>
  );
};
