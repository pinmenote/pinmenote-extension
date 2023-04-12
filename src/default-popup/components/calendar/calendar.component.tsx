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
import React, { FunctionComponent, useState } from 'react';
import { CalendarAddDayComponent } from './add/calendar-add-day.component';
import { CalendarAddDescriptionComponent } from './add/calendar-add-description.component';
import { CalendarAddHourComponent } from './add/calendar-add-hour.component';
import { CalendarEventListComponent } from './calendar-event-list.component';

enum CurrentView {
  EVENT_LIST = 1,
  EVENT_ADD_DAY,
  EVENT_ADD_HOUR,
  EVENT_ADD_DESCRIPTION,
  EVENT_EDIT
}

export const CalendarComponent: FunctionComponent = () => {
  const [state, setState] = useState<CurrentView>(CurrentView.EVENT_LIST);
  const [addDate, setAddDate] = useState<Date | undefined>();

  const handleAddDay = (dt: Date) => {
    setAddDate(dt);
    setState(CurrentView.EVENT_ADD_HOUR);
  };

  const handleAddHour = (hour: number) => {
    addDate?.setHours(hour);
    setState(CurrentView.EVENT_ADD_DESCRIPTION);
  };

  const handleAddEvent = () => {
    // TODO reload event list
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
      case CurrentView.EVENT_ADD_DESCRIPTION:
        return (
          <CalendarAddDescriptionComponent
            addDate={addDate}
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
