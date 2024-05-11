import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer
} from 'recharts';

const extendData = (data) => {
  const lastDataPoint = data[data.length - 1];
  // Adding an additional data point if data exists
  if (lastDataPoint) {
    const extendedDataPoint = { ...lastDataPoint, fractionNumber: 'Finish' };
    return [...data, extendedDataPoint];
  }
  return data;
};

const formatTickX = (tickItem) => {
  // Check for the first and last label
  if (tickItem === 0) return 'Start';
  if (tickItem === 'Finish') return 'Finish';
  return tickItem;
};

const formatTickY = (value) => {
  return `${value}%`; // Appends a percentage sign next to each Y-axis value
};

const PlotFractions = ({ data }) => {
  const extendedData = extendData(data);  // Ensuring the last point is extended
  // Replacing first data point's label to "Start" if there is any data
  if (extendedData.length > 0) {
    extendedData[0].fractionNumber = 'Start';
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
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
        <Line type="stepAfter" dataKey="percentage" stroke="#8884d8" dot={false}  />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PlotFractions;
