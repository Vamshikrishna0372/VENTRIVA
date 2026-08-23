import React from 'react';
import { Badge } from '../common/Badge';
import { getClosingBadgeVariant } from '../../utils/closingConstants';

export const ClosingStatusBadge = ({ status, size = 'sm', className = '' }) => {
  const variant = getClosingBadgeVariant(status);
  return (
    <Badge variant={variant} size={size} className={className}>
      {status || 'Pending'}
    </Badge>
  );
};

export default ClosingStatusBadge;
