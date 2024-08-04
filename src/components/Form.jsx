import React, { useState } from 'react';
import axios from 'axios';
import MitigationStrategyCard from './MitigationStrategy'; // Adjust the import if necessary

const Form = () => {
  const [output, setOutput] = useState([]);
  const [formData, setFormData] = useState({
    'Enter the Process': '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/', formData);
      console.log('Data submitted successfully:', response.data);
      setOutput(response.data);
     
    } catch (error) {
      console.error('There was an error submitting the form!', error);
    }
  };

  return (
    <div className="bg-green-100 flex items-center justify-center min-h-screen py-10">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl space-y-8 lg:space-y-0 lg:space-x-8">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full lg:w-1/2" style={{ maxHeight: '600px' }}>
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Process Form</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="Enter the Process" className="block text-sm font-medium text-gray-700 mb-1">Enter the Process</label>
              <input
                type="text"
                id="Enter the Process"
                name="Enter the Process"
                value={formData['Enter the Process']}
                onChange={handleChange}
                className="w-full p-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="text-center">
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
                Submit
              </button>
            </div>
          </form>
        </div>
        {output.length > 0 && (
          <div className="bg-white p-8 rounded-lg shadow-lg w-full lg:w-1/2" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <h3 className="text-xl font-bold mb-4 text-gray-800">Mitigation Strategies</h3>
            {output.map((strategy, index) => (
              <MitigationStrategyCard key={index} strategy={strategy} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Form;
