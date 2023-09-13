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
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

interface Props {
  repeat: string;
  addCallback: (value: string) => void;
}

export const CalendarAddRepeatComponent: FunctionComponent<Props> = (props) => {
  const handleAdd = (value: string) => {
    props.addCallback(value);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{ position: 'absolute', top: 104, background: '#ffffff', zIndex: 1000, minHeight: 30, width: '100%' }}
      >
        <Typography style={{ marginTop: 6 }}>Select Repeat</Typography>
      </div>
      <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column' }}>
        <Button style={{ margin: 10 }} variant="outlined" onClick={() => handleAdd('no')}>
          No
        </Button>
        <Button style={{ margin: 10 }} variant="outlined" onClick={() => handleAdd('hour')}>
          Every Hour
        </Button>
        <Button style={{ margin: 10 }} variant="outlined" onClick={() => handleAdd('day')}>
          Every Day
        </Button>
        <Button style={{ margin: 10 }} variant="outlined" onClick={() => handleAdd('month')}>
          Every Month
        </Button>
        <Button style={{ margin: 10 }} variant="outlined" onClick={() => handleAdd('year')}>
          Every Year
        </Button>
      </div>
    </div>
  );
};
