import React from 'react';

const Tools = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-24 h-24 bg-primary-fixed rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-primary text-5xl" data-icon="handyman">handyman</span>
      </div>
      <h1 className="text-4xl font-headline-lg text-primary mb-4">Tools Page</h1>
      <p className="text-on-surface-variant text-center max-w-lg text-lg">
        Discover high quality farming tools and equipment to improve your yield and efficiency.
      </p>
    </div>
  );
};

export default Tools;
