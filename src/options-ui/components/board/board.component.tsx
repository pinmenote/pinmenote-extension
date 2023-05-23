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
import { ObjPageDto, ObjPagePinDto } from '../../../common/model/obj/obj-pin.dto';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { BoardStore } from '../../store/board.store';
import { NoteElement } from './note/note.element';
import { ObjNoteDto } from '../../../common/model/obj/obj-note.dto';
import { PageSnapshotElement } from './page-snapshot/page-snapshot.element';
import { PinElement } from './pin/pin.element';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export const BoardComponent: FunctionComponent = () => {
  const [objData, setObjData] = useState<ObjDto[]>(BoardStore.objList);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Infinite scroll
    if (objData.length == 0 && !BoardStore.isLast) {
      setTimeout(async () => {
        BoardStore.setRefreshCallback(refreshBoardCallback);
        await BoardStore.clearSearch();
        await BoardStore.getObjRange();
      }, 0);
    }
    ref.current?.addEventListener('scroll', handleScroll);
    return () => {
      ref.current?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const refreshBoardCallback = () => {
    setObjData(BoardStore.objList.concat());
  };

  const handleScroll = () => {
    fnConsoleLog('handleScroll');
    if (!ref.current) return;
    if (BoardStore.isLast) return; // last element so return
    const bottom = ref.current.scrollHeight - ref.current.clientHeight;
    if (bottom - ref.current.scrollTop > 100) return; // too much up

    window.setTimeout(async () => {
      await BoardStore.getObjRange();
    }, 250);
  };

  const boardElements: any[] = [];
  for (let i = 0; i < objData.length; i++) {
    const obj = objData[i];
    switch (obj.type) {
      case ObjTypeDto.PageSnapshot:
      case ObjTypeDto.PageElementSnapshot: {
        boardElements.push(
          <PageSnapshotElement
            refreshBoardCallback={refreshBoardCallback}
            dto={obj as ObjDto<ObjPageDto>}
            key={obj.id}
          />
        );
        break;
      }
      case ObjTypeDto.PageElementPin: {
        boardElements.push(
          <PinElement refreshBoardCallback={refreshBoardCallback} dto={obj as ObjDto<ObjPagePinDto>} key={obj.id} />
        );
        break;
      }
      case ObjTypeDto.PageNote: {
        boardElements.push(
          <NoteElement key={obj.id} dto={obj as ObjDto<ObjNoteDto>} refreshBoardCallback={refreshBoardCallback} />
        );
        break;
      }
      default: {
        boardElements.push(
          <div key={obj.id}>
            <h1>Not Supported, TODO: {obj.type}</h1>
          </div>
        );
        break;
      }
    }
  }

  return (
    <div>
      <div
        ref={ref}
        style={{
          width: '100%',
          display: 'flex',
          overflow: 'auto',
          flexWrap: 'wrap',
          justifyContent: 'center',
          flexDirection: 'row',
          height: 'calc(100vh - 65px)',
          gap: '5px'
        }}
      >
        {boardElements}
      </div>
    </div>
  );
};
