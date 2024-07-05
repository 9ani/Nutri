import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const NutritionChart = ({ userData = [] }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const providedData = [
      {"date":"2024-07-01","calories":2000,"protein":200,"carbohydrates":300.33,"fiber":250.33,"calcium":190.33,"iron":400.33,"potassium":450.33},
      {"date":"2024-07-02","calories":1800,"protein":278,"carbohydrates":250,"fiber":300,"calcium":350,"iron":195,"potassium":285},
      {"date":"2024-07-03","calories":1900,"protein":315.67,"carbohydrates":325.67,"fiber":360.67,"calcium":345.67,"iron":325.67,"potassium":340.67},
      {"date":"2024-07-04","calories":2100,"protein":350,"carbohydrates":340,"fiber":390,"calcium":400,"iron":430,"potassium":420},
      {"date":"2024-07-05","calories":1850,"protein":308.33,"carbohydrates":308.33,"fiber":308.33,"calcium":308.33,"iron":308.33,"potassium":308.33},
      {"date":"2024-07-06","calories":1950,"protein":325,"carbohydrates":325,"fiber":325,"calcium":325,"iron":325,"potassium":325},
      {"date":"2024-07-07","calories":1800,"protein":300,"carbohydrates":300,"fiber":300,"calcium":300,"iron":300,"potassium":300}
    ];
    setData(providedData);
  }, []);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        width={600}
        height={400}
        data={data}
        margin={{
          top: 20, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="calories" stroke="#8884d8" />
        <Line type="monotone" dataKey="protein" stroke="#82ca9d" />
        <Line type="monotone" dataKey="carbohydrates" stroke="#ffc658" />
        <Line type="monotone" dataKey="fiber" stroke="#ff7300" />
        <Line type="monotone" dataKey="calcium" stroke="#0088FE" />
        <Line type="monotone" dataKey="iron" stroke="#00C49F" />
        <Line type="monotone" dataKey="potassium" stroke="#FFBB28" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default NutritionChart;
