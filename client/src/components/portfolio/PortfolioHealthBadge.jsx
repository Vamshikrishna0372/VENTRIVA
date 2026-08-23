import React from 'react';
import { Badge } from '../common/Badge';
import { HEALTH_STATUS_COLORS } from '../../utils/portfolioConstants';

export const PortfolioHealthBadge = ({ healthStatus = 'Healthy', score, size = 'sm' }) => {
  const variant = HEALTH_STATUS_COLORS[healthStatus] || 'teal';
  return (
    <Badge variant={variant} size={size}>
      {healthStatus} {score !== undefined ? `(${score}/100)` : ''}
    </Badge>
  );
};

export default PortfolioHealthBadge;
