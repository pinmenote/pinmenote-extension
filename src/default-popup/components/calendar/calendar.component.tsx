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
import { CalendarDateType, CalendarEvent } from './calendar.model';
import React, { FunctionComponent, useState } from 'react';
import { CalendarAddDayComponent } from './add/calendar-add-day.component';
import { CalendarAddDescriptionComponent } from './add/calendar-add-description.component';
import { CalendarAddHourComponent } from './add/calendar-add-hour.component';
import { CalendarAddMinuteComponent } from './add/calendar-add-minute.component';
import { CalendarAddRepeatComponent } from './add/calendar-add-repeat.component';
import { CalendarEventListComponent } from './calendar-event-list.component';
import dayjs from 'dayjs';

enum CurrentView {
  EVENT_LIST = 1,
  EVENT_ADD_DAY,
  EVENT_ADD_HOUR,
  EVENT_ADD_MINUTE,
  EVENT_ADD_REPEAT,
  EVENT_ADD_DESCRIPTION,
  EVENT_EDIT
}

export const CalendarComponent: FunctionComponent = () => {
  const [state, setState] = useState<CurrentView>(CurrentView.EVENT_LIST);
  const [type, setType] = useState<CalendarDateType>(CalendarDateType.START);
  const [event, setEvent] = useState<CalendarEvent>({
    repeat: 'no',
    title: '',
    description: ''
  });

  const handleAddDay = (dt: Date) => {
    if (type === CalendarDateType.START) {
      event.startDate = dt;
    } else {
      event.endDate = dt;
    }
    setEvent(event);
    setState(CurrentView.EVENT_ADD_HOUR);
  };

  const handleAddHour = (hours: number) => {
    if (type === CalendarDateType.START) {
      const d = event.startDate;
      d?.setHours(hours);
      d?.setSeconds(0);
      d?.setMilliseconds(0);
      event.startDate = d;
    } else {
      const d = event.endDate;
      d?.setHours(hours);
      d?.setSeconds(0);
      d?.setMilliseconds(0);
      d?.setMilliseconds(0);
      event.endDate = d;
    }
    setEvent(event);
    setState(CurrentView.EVENT_ADD_MINUTE);
  };

  const handleAddMinute = (minutes: number) => {
    if (type === CalendarDateType.START) {
      const sd = event.startDate;
      sd?.setMinutes(minutes);
      event.startDate = sd;
      // set end date 30min by default
      if (!event.endDate && sd) {
        const ed = new Date(sd);
        ed.setMinutes(ed.getMinutes() + 30);
        ed.setSeconds(0);
        ed.setMilliseconds(0);
        event.endDate = ed;
      }
    } else {
      const ed = event.endDate;
      ed?.setMinutes(minutes);
      event.endDate = ed;
    }
    setEvent(event);
    setState(CurrentView.EVENT_ADD_DESCRIPTION);
  };

  const handleChangeType = (type: CalendarDateType) => {
    setType(type);
    setState(CurrentView.EVENT_ADD_DAY);
  };

  const handleAddRepeat = (value: string) => {
    event.repeat = value;
    setEvent(event);
    setState(CurrentView.EVENT_ADD_DESCRIPTION);
  };

  const handleEventChange = (value: CalendarEvent) => {
    setEvent(value);
  };

  const handleAddEvent = (value: CalendarEvent) => {
    // TODO reload event list
    const sd = dayjs(value.startDate).format('YYYY-MM-DD HH:mm:ss');
    const ed = dayjs(value.endDate).format('YYYY-MM-DD HH:mm:ss');
    alert(`Add ${sd} ${ed} \n repeat ${value.repeat} ${value.title} ${value.description}`);
    setState(CurrentView.EVENT_LIST);
  };

  const handleCancel = () => {
    setState(CurrentView.EVENT_LIST);
  };

  const getComponent = () => {
    switch (state) {
      case CurrentView.EVENT_ADD_DAY:
        return <CalendarAddDayComponent acceptCallback={handleAddDay} />;
      case CurrentView.EVENT_ADD_HOUR:
        return <CalendarAddHourComponent addCallback={handleAddHour} />;
      case CurrentView.EVENT_ADD_MINUTE:
        return <CalendarAddMinuteComponent addCallback={handleAddMinute} />;
      case CurrentView.EVENT_ADD_REPEAT:
        return <CalendarAddRepeatComponent repeat={event.repeat} addCallback={handleAddRepeat} />;
      case CurrentView.EVENT_ADD_DESCRIPTION:
        return (
          <CalendarAddDescriptionComponent
            event={event}
            repeatCallback={() => setState(CurrentView.EVENT_ADD_REPEAT)}
            changeTypeCallback={handleChangeType}
            changeCallback={handleEventChange}
            addCallback={handleAddEvent}
            cancelCallback={handleCancel}
          />
        );
      default:
        return <CalendarEventListComponent addEventCallback={() => setState(CurrentView.EVENT_ADD_DAY)} />;
    }
  };

  const component = getComponent();

  return <div>{component}</div>;
};
