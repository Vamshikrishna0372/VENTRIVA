import React from 'react';
import { Badge } from '../common/Badge';
import { getStatusBadgeVariant } from '../../utils/fundraisingConstants';

export const RoundStatusBadge = ({ status, size = 'sm', className = '' }) => {
  const variant = getStatusBadgeVariant(status);
  return (
    <Badge variant={variant} size={size} className={className}>
      {status || 'Unknown'}
    </Badge>
  );
};

export default RoundStatusBadge;
