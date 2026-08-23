import React from 'react';
import { Badge } from '../common/Badge';
import { DEAL_STATUS_COLORS } from '../../utils/dealConstants';

export const DealStatusBadge = ({ status = 'Active', size = 'sm' }) => {
  const variant = DEAL_STATUS_COLORS[status] || 'brand';
  return (
    <Badge variant={variant} size={size}>
      {status}
    </Badge>
  );
};

export default DealStatusBadge;
