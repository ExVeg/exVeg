import React from 'react';

const Nursery = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-24 h-24 bg-primary-fixed rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-primary text-5xl" data-icon="nature_people">nature_people</span>
      </div>
      <h1 className="text-4xl font-headline-lg text-primary mb-4">Nursery Page</h1>
      <p className="text-on-surface-variant text-center max-w-lg text-lg">
        Explore a wide variety of young plants and saplings for your agricultural needs.
      </p>
    </div>
  );
};

export default Nursery;
