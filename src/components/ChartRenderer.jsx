import React from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, RadialBarChart, RadialBar,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './ChartRenderer.css';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

/**
 * ChartRenderer Component
 * Renders interactive charts based on chartData payload from backend
 * 
 * Expected chartData format:
 * {
 *   chartType: "bar|pie|line|area|radar|radial|composed",
 *   title: "Chart Title",
 *   data: [{ name: "Label", value: 100, ... }, ...],
 *   config: { xKey: "name", yKey: "value" }
 * }
 */
const ChartRenderer = ({ chartData, onDrillDown }) => {
  if (!chartData || !chartData.data || chartData.data.length === 0) {
    return null;
  }

  const { chartType = 'bar', title, data, config = {} } = chartData;
  const xKey = config.xKey || 'name';
  const yKey = config.yKey || 'value';
  const displayKey = 'displayName'; // Use displayName for chart labels

  // Universal click handler for drill-down - always use full name
  const handleChartClick = (entry) => {
    let clickedValue = null;

    // Always prioritize the full 'name' field from payload for drill-down
    if (entry && entry.payload && entry.payload.name) {
      clickedValue = entry.payload.name;
    } else if (entry && entry.name) {
      clickedValue = entry.name;
    } else if (entry && entry.activeLabel) {
      clickedValue = entry.activeLabel;
    } else if (entry && entry.payload && entry.payload[xKey]) {
      clickedValue = entry.payload[xKey];
    }

    if (onDrillDown && clickedValue) {
      onDrillDown(`Tell me more details about ${clickedValue}`);
    }
  };

  const cursorStyle = { cursor: 'pointer' };

  // Custom tooltip formatter
  const formatValue = (value) => {
    if (typeof value === 'number') {
      return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
    return value;
  };

  const renderChart = () => {
    switch (chartType) {
      case 'radial':
        return (
          <RadialBarChart 
            cx="50%" cy="50%" 
            innerRadius="10%" outerRadius="80%" 
            barSize={20} 
            data={data}
          >
            <RadialBar
              minAngle={15}
              label={{ position: 'insideStart', fill: '#fff' }}
              background
              clockWise
              dataKey={yKey}
              nameKey={displayKey}
              onClick={handleChartClick}
              style={cursorStyle}
            />
            <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{right: 0}} />
            <Tooltip formatter={formatValue} labelFormatter={(value) => data.find(d => d[displayKey] === value)?.name || value} />
          </RadialBarChart>
        );

      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey={displayKey} tick={{ fill: '#6b7280', fontSize: 12 }} />
            <PolarRadiusAxis />
            <Radar 
              name={title} 
              dataKey={yKey} 
              stroke="#6366f1" 
              fill="#6366f1" 
              fillOpacity={0.5}
              onClick={handleChartClick}
              style={cursorStyle}
            />
            <Tooltip formatter={formatValue} labelFormatter={(value) => data.find(d => d[displayKey] === value)?.name || value} />
          </RadarChart>
        );

      case 'line':
        return (
          <LineChart data={data} onClick={(e) => handleChartClick(e)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={displayKey} tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={formatValue} />
            <Tooltip formatter={formatValue} labelFormatter={(value) => data.find(d => d[displayKey] === value)?.name || value} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={yKey} 
              stroke="#6366f1" 
              strokeWidth={3} 
              dot={{ fill: '#6366f1', strokeWidth: 2 }}
              activeDot={{ r: 8, fill: '#4f46e5' }} 
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data} onClick={(e) => handleChartClick(e)}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={displayKey} tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={formatValue} />
            <Tooltip formatter={formatValue} labelFormatter={(value) => data.find(d => d[displayKey] === value)?.name || value} />
            <Area 
              type="monotone" 
              dataKey={yKey} 
              stroke="#6366f1" 
              fillOpacity={1} 
              fill="url(#colorValue)" 
            />
          </AreaChart>
        );

      case 'composed':
        return (
          <ComposedChart data={data} onClick={(e) => handleChartClick(e)}>
            <CartesianGrid stroke="#e5e7eb" />
            <XAxis dataKey={displayKey} tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={formatValue} />
            <Tooltip formatter={formatValue} labelFormatter={(value) => data.find(d => d[displayKey] === value)?.name || value} />
            <Legend />
            <Bar dataKey={yKey} barSize={30} fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey={yKey} stroke="#ef4444" strokeWidth={2} />
          </ComposedChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey={yKey}
              nameKey={displayKey}
              label={({ payload, percent }) => {
                const displayName = payload[displayKey];
                return `${displayName}: ${(percent * 100).toFixed(0)}%`;
              }}
              onClick={handleChartClick}
              style={cursorStyle}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={formatValue} labelFormatter={(value) => data.find(d => d[displayKey] === value)?.name || value} />
            <Legend />
          </PieChart>
        );

      case 'bar':
      default:
        return (
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey={displayKey} 
              tick={{ fill: '#6b7280', fontSize: 11 }}
              interval={0}
              angle={data.length > 5 ? -45 : 0}
              textAnchor={data.length > 5 ? 'end' : 'middle'}
              height={data.length > 5 ? 80 : 40}
            />
            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={formatValue} />
            <Tooltip formatter={formatValue} labelFormatter={(value) => data.find(d => d[displayKey] === value)?.name || value} />
            <Bar 
              dataKey={yKey} 
              fill="#6366f1" 
              radius={[6, 6, 0, 0]}
              onClick={handleChartClick}
              style={cursorStyle}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        );
    }
  };

  return (
    <div className="chart-container">
      {title && <h4 className="chart-title">{title}</h4>}
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartRenderer;
