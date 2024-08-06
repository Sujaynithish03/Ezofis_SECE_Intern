import React from 'react';

const ProcessCard = ({ step, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg mb-4 border border-gray-200 max-w-fit">
    <h4 className="text-lg font-bold mb-2">{step}</h4>
    <p className="text-sm text-gray-700 mb-2">{description}</p>
  </div>
);

export default ProcessCard;
