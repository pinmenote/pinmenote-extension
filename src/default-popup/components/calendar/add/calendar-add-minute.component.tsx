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
import React, { FunctionComponent, useEffect, useRef } from 'react';
import List from '@mui/material/List';
import { ListItem } from '@mui/material';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

interface CalendarAddMinuteComponentProps {
  addCallback: (minute: number) => void;
}

const formatMinute = (m: number) => {
  return m > 9 ? `00:${m}` : `00:0${m}`;
};

export const CalendarAddMinuteComponent: FunctionComponent<CalendarAddMinuteComponentProps> = (props) => {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const dt = formatMinute(new Date().getMinutes());
    const listChildren = Array.from(ref.current.children);
    for (const li of listChildren) {
      if (li instanceof HTMLElement && li.innerText === dt) {
        // scroll
        li.setAttribute('tabindex', '-1');
        li.focus();
        li.removeAttribute('tabindex');
        break;
      }
    }
  }, []);

  const handleAdd = (minutes: number) => {
    props.addCallback(minutes);
  };

  const items = [];

  for (let i = 0; i <= 59; i++) {
    items.push(
      <ListItem key={`hour-${i}`}>
        <ListItemButton style={{ border: '1px dashed #000000', borderRadius: '5px' }} onClick={() => handleAdd(i)}>
          <ListItemText primary={formatMinute(i)} />
        </ListItemButton>
      </ListItem>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{ position: 'absolute', top: 104, background: '#ffffff', zIndex: 1000, minHeight: 30, width: '100%' }}
      >
        <Typography style={{ marginTop: 6 }}>Select Minute</Typography>
      </div>
      <div style={{ marginTop: 20 }}>
        <List ref={ref}>{items}</List>
      </div>
    </div>
  );
};
