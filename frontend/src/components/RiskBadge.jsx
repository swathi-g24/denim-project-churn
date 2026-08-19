import React from 'react';

const RiskBadge = ({ riskLevel }) => {
  const getBadgeClass = (level) => {
    switch (level) {
      case 'Low Risk':
        return 'risk-badge-low';
      case 'Medium Risk':
        return 'risk-badge-medium';
      case 'High Risk':
        return 'risk-badge-high';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`risk-badge ${getBadgeClass(riskLevel)}`}>
      {riskLevel || 'Unknown'}
    </span>
  );
};

export default RiskBadge;
