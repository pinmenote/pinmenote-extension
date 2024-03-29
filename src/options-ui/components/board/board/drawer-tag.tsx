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

interface Props {
  value: string;
  selected: boolean;
  selectionChange: (value: string) => void;
}

const tagStyle = {
  fontSize: '1.5em',
  width: '100%',
  textAlign: 'center',
  userSelect: 'none',
  cursor: 'pointer',
  marginTop: 5
};

export const DrawerTag: FunctionComponent<Props> = (props) => {
  const [selected, setSelected] = useState<boolean>(props.selected);
  const handleClick = () => {
    setSelected(!selected);
    props.selectionChange(props.value);
  };
  return (
    <div style={{ fontWeight: selected ? 'bold' : 'normal', ...(tagStyle as any) }} onClick={handleClick}>
      {props.value}
    </div>
  );
};
