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
import { ObjDto, ObjPageDataDto, ObjTypeDto } from '../../../common/model/obj/obj.dto';
import React, { FunctionComponent, useState } from 'react';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { ObjPagePinDto } from '../../../common/model/obj/obj-pin.dto';
import { ObjSnapshotDto } from '../../../common/model/obj/obj-snapshot.dto';
import { PageSnapshotRemoveCommand } from '../../../common/command/snapshot/page-snapshot-remove.command';
import { PinListElement } from './pin-list-element.component';
import { PinRemoveCommand } from '../../../common/command/pin/pin-remove.command';
import { SnapshotListElement } from './snapshot-list-element.component';

interface PinListProps {
  objList: ObjDto<ObjPageDataDto>[];
  visibility: boolean;
}

export const ObjListComponent: FunctionComponent<PinListProps> = ({ objList, visibility }) => {
  const [reRender, setReRender] = useState(false);

  const handlePinRemove = async (data: ObjDto<ObjPagePinDto>) => {
    await new PinRemoveCommand(data).execute();
    await BrowserApi.sendTabMessage<number>({ type: BusMessageType.CONTENT_PIN_REMOVE, data: data.id });
    handleRemove(data.id);
  };

  const handleSnapshotRemove = async (data: ObjDto<ObjSnapshotDto>) => {
    await new PageSnapshotRemoveCommand(data).execute();
    handleRemove(data.id);
  };

  const handleRemove = (id: number) => {
    for (let i = 0; i < objList.length; i++) {
      const obj = objList[i];
      if (obj.id === id) {
        objList.splice(i, 1);
        setReRender(!reRender);
        break;
      }
    }
  };

  // Render pins
  const objs: React.ReactNode[] = [];
  for (const obj of objList) {
    if (obj.type === ObjTypeDto.PageElementPin) {
      objs.push(
        <PinListElement
          key={obj.id}
          visibility={visibility}
          obj={obj as ObjDto<ObjPagePinDto>}
          removeCallback={handlePinRemove}
        />
      );
    } else if (obj.type === ObjTypeDto.PageElementSnapshot || obj.type === ObjTypeDto.PageSnapshot) {
      objs.push(
        <SnapshotListElement key={obj.id} obj={obj as ObjDto<ObjSnapshotDto>} removeCallback={handleSnapshotRemove} />
      );
    }
  }
  return (
    <div style={{ width: '100%' }}>
      <div style={{ width: '100%' }}>{objs}</div>
    </div>
  );
};
