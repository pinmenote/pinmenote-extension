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
import Button from '@mui/material/Button';
import { StyledInput } from '../../../../common/components/react/styled.input';
import TextareaAutosize from '@mui/material/TextareaAutosize';

interface CalendarAddDescriptionComponentProps {
  addDate?: Date;
  addCallback: () => void;
  cancelCallback: () => void;
}

export const CalendarAddDescriptionComponent: FunctionComponent<CalendarAddDescriptionComponentProps> = (props) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleEventAdd = () => {
    // TODO save event
    props.addCallback();
  };

  return (
    <div style={{ marginTop: 5 }}>
      <h2>Calendar event details</h2>
      <div style={{ border: `1px solid rgba(0,0,0,0.5)`, padding: 5, borderRadius: 5, marginBottom: 10 }}>
        <StyledInput value={title} onChange={handleTitleChange} placeholder="Title" />
      </div>
      <div>
        <TextareaAutosize
          style={{ borderRadius: 5, padding: 5 }}
          value={description}
          onChange={handleDescriptionChange}
          minRows={15}
          maxRows={17}
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
