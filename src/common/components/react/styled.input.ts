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
import Input from '@mui/material/Input';
import styled from '@mui/material/styles/styled';

export const StyledInput = styled(Input)({
  width: '100%',
  ':before': {
    borderBottom: 'none'
  },
  ':after': {
    borderBottom: 'none'
  },
  '&:hover:before': {
    borderBottom: 'none !important' // not working without !important cause @mui sucks
  }
});

export const StyledInputBlack = styled(Input)({
  marginTop: '2px',
  width: '100%',
  color: '#ffffff',
  backgroundColor: '#000000',
  ':before': {
    borderBottom: '1px solid #ffffff'
  },
  ':after': {
    borderBottom: '1px solid #ffffff'
  },
  '&:hover:before': {
    borderBottom: '1px solid #ffffff !important' // not working without !important cause @mui sucks
  }
});
