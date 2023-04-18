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
import { COLOR_DEFAULT_BORDER, DEFAULT_BORDER_RADIUS } from '../../../../common/components/colors';
import { CalendarDateType, CalendarEvent } from '../calendar.model';
import React, { ChangeEvent, FunctionComponent, useState } from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import RepeatIcon from '@mui/icons-material/Repeat';
import { StyledInput } from '../../../../common/components/react/styled.input';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import Typography from '@mui/material/Typography';
import UpdateIcon from '@mui/icons-material/Update';
import dayjs from 'dayjs';

interface CalendarAddDescriptionComponentProps {
  event: CalendarEvent;
  addCallback: (event: CalendarEvent) => void;
  changeCallback: (event: CalendarEvent) => void;
  cancelCallback: () => void;
  repeatCallback: () => void;
  changeTypeCallback: (type: CalendarDateType) => void;
}

const dtFormat = 'YYYY-MM-DD HH:mm:ss';

export const CalendarAddDescriptionComponent: FunctionComponent<CalendarAddDescriptionComponentProps> = (props) => {
  const [startDate, setStartDate] = useState<string>(dayjs(props.event.startDate).format(dtFormat));
  const [endDate, setEndDate] = useState<string>(dayjs(props.event.endDate).format(dtFormat));
  const [title, setTitle] = useState<string>(props.event.title);
  const [description, setDescription] = useState<string>(props.event.description);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    props.event.title = e.target.value;
    props.changeCallback(props.event);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    props.event.description = e.target.value;
    props.changeCallback(props.event);
  };

  const handleEventAdd = () => {
    // TODO save event
    const sd = dayjs(startDate, dtFormat);
    const ed = dayjs(endDate, dtFormat);
    props.event.startDate = sd.toDate();
    props.event.endDate = ed.toDate();
    props.addCallback(props.event);
  };

  const handleStartDateClick = () => {
    props.changeTypeCallback(CalendarDateType.START);
  };

  const handleEndDateClick = () => {
    props.changeTypeCallback(CalendarDateType.END);
  };

  const handleStartChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  const handleRepeatClick = () => {
    props.repeatCallback();
  };

  return (
    <div style={{ marginTop: 5 }}>
      <h2>Add Event</h2>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography>Start Date</Typography>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <div style={{ border: COLOR_DEFAULT_BORDER, borderRadius: DEFAULT_BORDER_RADIUS, minWidth: 170 }}>
            <StyledInput onChange={handleStartChange} sx={{ paddingLeft: 1 }} value={startDate} />
          </div>
          <IconButton onClick={handleStartDateClick}>
            <UpdateIcon />
          </IconButton>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 5
        }}
      >
        <Typography>End Date</Typography>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <div style={{ border: COLOR_DEFAULT_BORDER, borderRadius: DEFAULT_BORDER_RADIUS, minWidth: 170 }}>
            <StyledInput onChange={handleEndChange} sx={{ paddingLeft: 1 }} value={endDate} />
          </div>
          <IconButton onClick={handleEndDateClick}>
            <UpdateIcon />
          </IconButton>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <Typography>Repeat</Typography>
          <Typography style={{ marginLeft: 10 }}>{props.event.repeat}</Typography>
        </div>
        <IconButton onClick={handleRepeatClick}>
          <RepeatIcon />
        </IconButton>
      </div>
      <div
        style={{
          border: COLOR_DEFAULT_BORDER,
          padding: 5,
          borderRadius: DEFAULT_BORDER_RADIUS,
          marginBottom: 10,
          marginTop: 5
        }}
      >
        <StyledInput value={title} onChange={handleTitleChange} placeholder="Title" />
      </div>
      <div>
        <TextareaAutosize
          style={{ borderRadius: DEFAULT_BORDER_RADIUS, padding: 5 }}
          value={description}
          onChange={handleDescriptionChange}
          minRows={9}
          maxRows={9}
          cols={34}
          placeholder="Description"
        ></TextareaAutosize>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
        <Button variant="outlined" onClick={props.cancelCallback}>
          Cancel
        </Button>
        <Button variant="outlined" onClick={handleEventAdd}>
          Add
        </Button>
      </div>
    </div>
  );
};
