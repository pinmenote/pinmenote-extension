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
import { ObjDataDto, ObjDto, ObjTypeDto } from '../../../common/model/obj.model';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { BoardSearchInput } from '../menu/board-search.input';
import { BoardStore } from '../store/board.store';
import Box from '@mui/material/Box';
import { BusMessageType } from '../../../common/model/bus.model';
import { IconButton } from '@mui/material';
import { ObjPagePinDto } from '../../../common/model/obj-pin.model';
import { ObjRangeResponse } from 'src/common/model/obj-request.model';
import { PinElement } from './pin/pin.element';
import Stack from '@mui/material/Stack';
import { TinyEventDispatcher } from '../../../common/service/tiny.event.dispatcher';
import Typography from '@mui/material/Typography';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export const BoardComponent: FunctionComponent = () => {
  const [objData, setObjData] = useState<ObjDto<ObjDataDto>[]>(BoardStore.objList);

  const stackRef = useRef<HTMLDivElement>();

  useEffect(() => {
    // Infinite scroll
    stackRef.current?.addEventListener('scroll', handleScroll);

    const refreshKey = TinyEventDispatcher.addListener<undefined>(BusMessageType.OPT_REFRESH_BOARD, () => {
      setObjData(BoardStore.objList.concat());
    });

    const pinSearch = TinyEventDispatcher.addListener<ObjRangeResponse>(
      BusMessageType.OPTIONS_OBJ_SEARCH,
      (event, key, value) => {
        BoardStore.setData(value);
        setObjData(BoardStore.objList.concat());
        BoardStore.setLoading(false);
      }
    );
    const pinRange = TinyEventDispatcher.addListener<ObjRangeResponse>(
      BusMessageType.OPTIONS_OBJ_GET_RANGE,
      (event, key, value) => {
        BoardStore.setData(value);
        setObjData(BoardStore.objList.concat());
        BoardStore.setLoading(false);
      }
    );
    return () => {
      TinyEventDispatcher.removeListener(BusMessageType.OPT_REFRESH_BOARD, refreshKey);
      stackRef.current?.removeEventListener('scroll', handleScroll);
      TinyEventDispatcher.removeListener(BusMessageType.OPTIONS_OBJ_SEARCH, pinSearch);
      TinyEventDispatcher.removeListener(BusMessageType.OPTIONS_OBJ_GET_RANGE, pinRange);
    };
  });

  const handleScroll = () => {
    fnConsoleLog('handleScroll');
    if (BoardStore.isLast) return;
    if (!stackRef.current) return;
    const bottom = stackRef.current.scrollHeight - stackRef.current.clientHeight;
    // This is how offensive programming looks like - escape early instead of wrapping code with conditions
    if (bottom - stackRef.current.scrollTop > 100) return; // too much up
    if (BoardStore.isLoading) return; // already loading

    BoardStore.setLoading(true);

    // Search for value from last one
    if (BoardStore.getSearch()) {
      BoardStore.timeout = window.setTimeout(async () => {
        await BoardStore.sendSearch();
      }, 1000);
      return;
    }
    window.setTimeout(async () => {
      await BoardStore.sendRange();
    }, 250);
  };

  const boardElements: any[] = [];
  for (let i = 0; i < objData.length; i++) {
    const obj = objData[i];
    if (obj.type === ObjTypeDto.PageElementPin) {
      boardElements.push(<PinElement pin={obj as ObjDto<ObjPagePinDto>} key={obj.id} />);
    } else {
      fnConsoleLog('NOT SUPPORTED !!!', obj);
      boardElements.push(
        <div key={obj.id}>
          <h1>Not Supported, TODO: {obj.type}</h1>
        </div>
      );
    }
  }

  return (
    <div style={{ width: '100%', marginLeft: 20, marginTop: 10 }}>
      <Box style={{ margin: 10, display: 'flex', flexDirection: 'row' }}>
        <BoardSearchInput></BoardSearchInput>
        <IconButton>
          <Typography>aaaa</Typography>
        </IconButton>
      </Box>
      <Stack direction="row" flexWrap="wrap" ref={stackRef} style={{ overflow: 'auto', height: 'calc(100vh - 65px)' }}>
        {boardElements}
      </Stack>
    </div>
  );
};
