import React, { FunctionComponent } from 'react';
import { ObjDto } from '../../../common/model/obj/obj.dto';
import { ObjTaskDto } from '../../../common/model/obj/obj-task.dto';

interface Props {
  editCallback: (obj: ObjDto<ObjTaskDto>) => void;
}

export const TaskListComponent: FunctionComponent<Props> = () => {
  return (
    <div>
      <h2>List</h2>
    </div>
  );
};
