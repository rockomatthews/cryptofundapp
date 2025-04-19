import React from 'react';
import { Grid as MuiGrid, GridProps as MuiGridProps } from '@mui/material';

// This is a wrapper component for Material UI v7 Grid
// It properly handles the 'item' prop by using it as a variant
export interface GridProps extends Omit<MuiGridProps, 'item'> {
  item?: boolean;
  xs?: number | boolean;
  sm?: number | boolean;
  md?: number | boolean;
  lg?: number | boolean;
  xl?: number | boolean;
}

export const Grid: React.FC<GridProps> = ({ 
  item, 
  children, 
  ...props 
}) => {
  // If item is true, set the Grid variant to "item"
  const gridProps: MuiGridProps & { variant?: string } = {
    ...props,
    ...(item && { variant: "item" })
  };

  return <MuiGrid {...gridProps}>{children}</MuiGrid>;
};

export default Grid; 