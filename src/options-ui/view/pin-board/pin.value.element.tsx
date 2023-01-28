/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2022 Michal Szczepanski.
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
import { ObjBoardViewDto, ObjDto } from '../../../common/model/obj.model';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import ClearIcon from '@mui/icons-material/Clear';
import DownloadIcon from '@mui/icons-material/Download';
import { EditorView } from 'prosemirror-view';
import HtmlIcon from '@mui/icons-material/Html';
import { IconButton } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import { ObjPagePinDto } from '../../../common/model/obj-pin.model';
import { PinBoardStore } from '../store/pin-board.store';
import { PinUpdateCommand } from '../../../common/command/pin/pin-update.command';
import ShareIcon from '@mui/icons-material/Share';
import { TinyEventDispatcher } from '../../../common/service/tiny.event.dispatcher';
import { createTextEditorState } from '../../../common/components/text-editor/text.editor.state';
import { defaultMarkdownSerializer } from 'prosemirror-markdown';
import { fnB64toBlob } from '../../../common/fn/b64.to.blob.fn';
import { pinIframeFn } from '../../../common/fn/pin/pin.iframe.fn';

interface PinValueProps {
  pin: ObjDto<ObjPagePinDto>;
}

export const PinValueElement: FunctionComponent<PinValueProps> = ({ pin }): JSX.Element => {
  const [styleIcon, setStyleIcon] = useState<boolean>(
    !pin.local.boardView || pin.local.boardView === ObjBoardViewDto.Screenshot
  );
  const handleRemove = async (): Promise<void> => {
    if (await PinBoardStore.removePin(pin)) {
      TinyEventDispatcher.dispatch<undefined>(BusMessageType.OPT_REFRESH_BOARD, undefined);
    }
  };

  const handleImageDownload = async (): Promise<void> => {
    let url: string, filename: string;
    if (pin.local.boardView === ObjBoardViewDto.Screenshot) {
      if (!pin.data.html[0].screenshot) return;
      url = window.URL.createObjectURL(fnB64toBlob(pin.data.html[0].screenshot, 'image/jpeg'));
      filename = `${pin.id}.jpg`;
    } else {
      const html = pinIframeFn(pin.data.html[0]) || '';
      url = window.URL.createObjectURL(new Blob([html], { type: 'text/html' }));
      filename = `${pin.id}.html`;
    }
    await BrowserApi.downloads.download({
      url,
      filename,
      conflictAction: 'uniquify'
    });
  };

  const handleShowImage = async (): Promise<void> => {
    setStyleIcon(!styleIcon);
    if (pin.local.boardView === ObjBoardViewDto.Screenshot) {
      pin.local.boardView = ObjBoardViewDto.Html;
    } else {
      pin.local.boardView = ObjBoardViewDto.Screenshot;
    }
    await new PinUpdateCommand(pin).execute();
    TinyEventDispatcher.dispatch<ObjDto<ObjPagePinDto>>(BusMessageType.OPT_PIN_SHOW_IMAGE, pin);
  };

  const handleShare = async (): Promise<void> => {
    await BrowserApi.sendRuntimeMessage<ObjDto<ObjPagePinDto>>({
      type: BusMessageType.OPTIONS_PIN_SHARE,
      data: pin
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
      <EditElement pin={pin} />
      <div style={{ display: 'flex', flexDirection: 'row', marginLeft: 20, alignItems: 'center' }}>
        <IconButton onClick={handleShare} title="share pin">
          <ShareIcon />
        </IconButton>
        <IconButton onClick={handleImageDownload} title="switch display image">
          <DownloadIcon />
        </IconButton>
        <IconButton onClick={handleShowImage} title="switch display image">
          {styleIcon ? <HtmlIcon /> : <ImageIcon />}
        </IconButton>
        <IconButton onClick={handleRemove} title="remove">
          <ClearIcon />
        </IconButton>
      </div>
    </div>
  );
};

const EditElement: FunctionComponent<PinValueProps> = ({ pin }): JSX.Element => {
  const divRef = useRef<HTMLDivElement>(null);

  const renderDiv = (ref: HTMLDivElement): void => {
    let state = createTextEditorState(pin.data.value);
    const view = new EditorView(ref, {
      state,
      dispatchTransaction: async (tx) => {
        state = state.apply(tx);
        view.updateState(state);
        pin.data.value = defaultMarkdownSerializer.serialize(state.doc);
        await new PinUpdateCommand(pin).execute();
      }
    });
  };

  useEffect(() => {
    if (divRef.current && !divRef.current?.firstChild) {
      renderDiv(divRef.current);
    }
  });

  return <div style={{ width: '100%' }} ref={divRef}></div>;
};
