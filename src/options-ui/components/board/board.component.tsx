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
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { BoardStore } from '../../store/board.store';
import { ObjPageDto } from '../../../common/model/obj/obj-page.dto';
import { ObjPageNoteDto } from '../../../common/model/obj/obj-note.dto';
import { ObjPdfDto } from '../../../common/model/obj/obj-pdf.dto';
import { PageNoteElement } from './page-note/page-note.element';
import { PageSnapshotElement } from './page-snapshot/page-snapshot.element';
import { PdfElement } from './pdf/pdf.element';

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
            obj={obj as ObjDto<ObjPageDto>}
            key={obj.id}
          />
        );
        break;
      }
      case ObjTypeDto.Pdf: {
        boardElements.push(
          <PdfElement key={obj.id} dto={obj as ObjDto<ObjPdfDto>} refreshBoardCallback={refreshBoardCallback} />
        );
        break;
      }
      case ObjTypeDto.PageNote: {
        boardElements.push(
          <PageNoteElement
            key={obj.id}
            dto={obj as ObjDto<ObjPageNoteDto>}
            refreshBoardCallback={refreshBoardCallback}
          />
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
  if (BoardStore.isLast) {
    boardElements.push(
      <div style={{ width: '100%', height: '100px', textAlign: 'center' }}>
        <h1 style={{ padding: 20 }}>THE END / FIN / KONIEC</h1>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
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
