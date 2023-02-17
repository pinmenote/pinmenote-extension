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
import React, { CSSProperties, FunctionComponent } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Typography from '@mui/material/Typography';
import { fnConsoleLog } from '../../../../common/fn/console.fn';

const elementStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid #333333',
  width: 500,
  padding: 10,
  marginBottom: 20,
  borderRadius: 5
};

const elementEditStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  border: '1px solid #333333',
  width: 500,
  padding: 10,
  marginBottom: 20,
  borderRadius: 5
};

export const UserSettingsComponent: FunctionComponent = () => {
  const handleEmailEditClick = () => {
    fnConsoleLog('Email Click');
  };

  const handleChangePlanClick = () => {
    fnConsoleLog('Change Plan Click');
  };

  return (
    <div>
      <Typography fontSize="2.5em">user</Typography>
      <div style={elementStyle}>
        <Typography fontSize="2em">username</Typography>
        <Typography fontSize="2em">aaa</Typography>
      </div>
      <div style={elementEditStyle}>
        <div>
          <Typography fontSize="2em">email</Typography>
          <Typography fontSize="2em">aaa@aaa.pl</Typography>
        </div>
        <IconButton onClick={handleEmailEditClick}>
          <EditIcon />
        </IconButton>
      </div>
      <div style={elementEditStyle}>
        <div>
          <Typography fontSize="2em">plan</Typography>
          <Typography fontSize="2em">free</Typography>
        </div>
        <IconButton onClick={handleChangePlanClick}>
          <ShoppingCartIcon />
        </IconButton>
      </div>
      <div style={elementStyle}>
        <Typography fontSize="2em">api url</Typography>
        <Typography fontSize="2em">http://localhost:3000</Typography>
      </div>
    </div>
  );
};
