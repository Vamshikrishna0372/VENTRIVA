import React from 'react';
import { Select } from '../common/Select';
import { ANALYTICS_PERIODS } from '../../utils/analyticsConstants';

export const AnalyticsFilter = ({ selectedPeriod, onChangePeriod, className = '' }) => {
  return (
    <div className={`w-44 ${className}`}>
      <Select
        value={selectedPeriod}
        onChange={(e) => onChangePeriod(e.target.value)}
        options={ANALYTICS_PERIODS}
      />
    </div>
  );
};

export default AnalyticsFilter;
