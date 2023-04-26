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
import TextareaAutosize from '@mui/material/TextareaAutosize';

interface TitleEditComponentProps {
  value: string;
  saveCallback: (value: string) => void;
  cancelCallback: () => void;
}

export const TitleEditComponent: FunctionComponent<TitleEditComponentProps> = (props) => {
  const [value, setValue] = useState<string>(props.value);
  return (
    <div style={{ width: '100%' }}>
      <div>
        <TextareaAutosize cols={40} value={value} onChange={(e) => setValue(e.target.value)} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Button onClick={() => props.cancelCallback()}>Cancel</Button>
        <Button onClick={() => props.saveCallback(value)}>Save</Button>
      </div>
    </div>
  );
};
