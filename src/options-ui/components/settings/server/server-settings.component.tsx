/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2022 Michal Szczepanski.
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
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { UserSettingsComponent } from '../user/user-settings.component';

export const ServerSettingsComponent: FunctionComponent = () => {
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const handleAddClick = () => {
    setIsAdding(true);
  };

  return (
    <div>
      <Typography fontSize="2.5em" style={{ marginBottom: 10 }}>
        servers
        <IconButton title="add server" onClick={handleAddClick} size="large">
          <AddIcon />
        </IconButton>
      </Typography>
      <div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', margin: 20 }}>
          <Typography fontSize="2em" style={{ marginLeft: 25 }}>
            pinmenote.com
          </Typography>
          <IconButton title="set as default">
            <ArrowForwardIcon />
          </IconButton>
        </div>
        <div>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', margin: 20 }}>
            <CheckIcon />
            <Typography fontSize="2em" style={{ marginRight: 10, userSelect: 'none', cursor: 'pointer' }}>
              localhost:3000
            </Typography>
            <Typography fontSize="1.2em">(default)</Typography>
          </div>
          <div style={{ marginLeft: 50 }}>
            <UserSettingsComponent></UserSettingsComponent>
          </div>
        </div>
      </div>
    </div>
  );
};
