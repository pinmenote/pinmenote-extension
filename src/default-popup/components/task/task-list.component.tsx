import React, { FunctionComponent } from 'react';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';

interface TaskListComponentProps {
  addCallback: () => void;
}

export const TaskListComponent: FunctionComponent<TaskListComponentProps> = (props) => {
  return (
    <div>
      <IconButton onClick={() => props.addCallback()}>
        <AddIcon />
      </IconButton>
    </div>
  );
};
