import React from 'react';

const Analytics = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-24 h-24 bg-primary-fixed rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-primary text-5xl" data-icon="analytics">analytics</span>
      </div>
      <h1 className="text-4xl font-headline-lg text-primary mb-4">Analytics Dashboard</h1>
      <p className="text-on-surface-variant text-center max-w-lg text-lg">
        View comprehensive data and insights to make informed agricultural decisions.
      </p>
    </div>
  );
};

export default Analytics;
