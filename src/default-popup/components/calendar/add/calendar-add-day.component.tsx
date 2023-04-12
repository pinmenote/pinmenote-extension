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
import { LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers';
import React, { FunctionComponent, useState } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import styled from '@mui/material/styles/styled';

const StyledStaticDatePicker = styled(StaticDatePicker)({
  '& .MuiPickersToolbar-root': {
    padding: 0
  },
  '& .MuiDialogActions-root': {
    marginTop: '-10px',
    marginLeft: '-40px',
    padding: 0,
    display: 'flex',
    justifyContent: 'center'
  },
  '& .MuiDialogActions-root :first-child': {
    // change to first-of-type
    display: 'none'
  },
  '& .MuiDialogActions-root > .MuiButton-root': {
    width: '260px',
    border: '1px solid rgba(0, 0, 0, 0.5)'
  },
  '& .MuiPickersCalendarHeader-root': {
    marginTop: '5px',
    paddingLeft: 0,
    paddingRight: '40px'
  },
  '& .MuiDayCalendar-header': {
    justifyContent: 'left'
  },
  '& .MuiDayCalendar-monthContainer > div': {
    justifyContent: 'left'
  }
});

interface CalendarAddComponentProps {
  acceptCallback: (dt: Date) => void;
}

export const CalendarAddDayComponent: FunctionComponent<CalendarAddComponentProps> = (props) => {
  const [date, setDate] = useState<Date>(new Date());

  const handleDateChange = (event: any) => {
    setDate(event.$d);
  };

  const handleAccept = () => {
    props.acceptCallback(date);
  };

  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <StyledStaticDatePicker onClose={handleAccept} onChange={handleDateChange} defaultValue={dayjs(date)} />
      </LocalizationProvider>
    </div>
  );
};
