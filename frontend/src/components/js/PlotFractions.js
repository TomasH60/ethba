import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer
} from 'recharts';

const extendData = (data) => {
  // First check to replace all NaN values if the data contains only NaN percentages
  const allNaN = data.every(point => isNaN(point.percentage));
  const cleanedData = data.map(point => ({
    ...point,
    percentage: allNaN ? 0 : (isNaN(point.percentage) ? 0 : point.percentage)
  }));

  if (cleanedData.length > 0) {
    // Ensure the start point is always 0%
    cleanedData[0].fractionNumber = 'Start';
    cleanedData[0].percentage = 0;

    // Adding a finish point with 100% or the last valid percentage
    const lastPercentage = cleanedData[cleanedData.length - 1].percentage;
    const finishPercentage = isNaN(lastPercentage) ? 0 : 100;
    cleanedData.push({ fractionNumber: 'Finish', percentage: finishPercentage });
  }

  return cleanedData;
};

const formatTickX = (tickItem) => {
  if (tickItem === 0) return 'Start';
  if (tickItem === 'Finish') return 'Finish';
  return tickItem;
};

const formatTickY = (value) => {
  return `${value}%`; // Appends a percentage sign next to each Y-axis value
};

const PlotFractions = ({ data }) => {
  const extendedData = extendData(data);
  
  return (
    <ResponsiveContainer width="100%" height={200}>
      <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', }}>
        Funding Distribution
      </div>
      <LineChart
        data={extendedData}
        margin={{
          top: 20, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="fractionNumber" tickFormatter={formatTickX} />
        <YAxis domain={[0, 100]} tickFormatter={formatTickY} />
        <Legend />
        <Line type="stepAfter" dataKey="percentage" stroke="#8884d8" dot={false} strokeWidth={4}/>
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PlotFractions;
