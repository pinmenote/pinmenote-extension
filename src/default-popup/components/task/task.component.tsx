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
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import { TaskListComponent } from './task-list.component';

enum CurrentView {
  TASK_LIST = 'TASK_LIST',
  TASK_ADD = 'TASK_ADD',
  TASK_EDIT = 'TASK_EDIT'
}

export const TaskComponent: FunctionComponent = () => {
  const [state, setState] = useState<CurrentView>(CurrentView.TASK_LIST);
  const getComponent = (state: CurrentView) => {
    switch (state) {
      case CurrentView.TASK_LIST:
        return <TaskListComponent />;
      case CurrentView.TASK_ADD:
        return 'TODO';
    }
  };
  const component = getComponent(state);
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <h2>Task</h2>
        <IconButton onClick={() => setState(CurrentView.TASK_ADD)}>
          <AddIcon />
        </IconButton>
      </div>
      {component}
    </div>
  );
};
