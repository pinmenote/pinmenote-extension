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
import React, { FunctionComponent, useEffect, useState } from 'react';
import { LogManager } from '../../../common/popup/log.manager';
import { NoteElementComponent } from './note-element.component';
import { NoteGetHrefCommand } from '../../../common/command/note/note-get-href.command';
import { ObjDto } from '../../../common/model/obj/obj.dto';
import { ObjNoteDto } from '../../../common/model/obj/obj-note.dto';
import { PopupActiveTabStore } from '../../store/popup-active-tab.store';

interface NoteListComponentProps {
  editCallback: (obj: ObjDto<ObjNoteDto>) => void;
}

export const NoteListComponent: FunctionComponent<NoteListComponentProps> = (props) => {
  const [noteList, setNoteList] = useState<ObjDto<ObjNoteDto>[]>([]);
  useEffect(() => {
    const url = PopupActiveTabStore.url;
    LogManager.log(`NoteListComponent->url ${url?.href || ''}`);
    if (!url) return;

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      const list = await new NoteGetHrefCommand(url).execute();
      setNoteList(list);
    })();
  }, []);

  const objs: React.ReactNode[] = [];
  for (const obj of noteList) {
    objs.push(<NoteElementComponent key={obj.id} obj={obj} editCallback={props.editCallback} />);
  }

  return <div style={{ display: 'flex', flexDirection: 'column' }}>{objs}</div>;
};
