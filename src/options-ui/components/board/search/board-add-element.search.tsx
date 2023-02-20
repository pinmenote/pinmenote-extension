import React, { FunctionComponent } from 'react';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { fnConsoleLog } from '../../../../common/fn/console.fn';

export const BoardAddElementSearch: FunctionComponent = () => {
  const [anchorEl, setAnchorEl] = React.useState<undefined | HTMLElement>();
  const open = Boolean(anchorEl);

  const handleAddClick = (e: React.MouseEvent<HTMLElement>) => {
    fnConsoleLog('BoardComponent->AddClick');
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(undefined);
  };

  const handleMenuClick = () => {
    handleClose();
  };

  return (
    <div>
      <IconButton onClick={handleAddClick}>
        <AddIcon />
      </IconButton>
      <Menu open={open} onClose={handleClose} anchorEl={anchorEl}>
        <MenuItem onClick={handleMenuClick}>Drawing</MenuItem>
        <MenuItem onClick={handleMenuClick}>Note</MenuItem>
        <MenuItem onClick={handleMenuClick}>Todo</MenuItem>
      </Menu>
    </div>
  );
};
