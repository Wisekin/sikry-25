import React from 'react';

interface QualityMetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  change?: string;
  changeColor?: string;
}

const QualityMetricCard: React.FC<QualityMetricCardProps> = ({
  title,
  value,
  unit,
  icon,
  change,
  changeColor = 'text-gray-500', // Default change color
}) => {
  return (
    <div
      className={`
        bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:bg-gray-50/50
        p-5 rounded-lg transition-all duration-200 ease-in-out
        flex flex-col justify-between min-h-[110px]
      `}
    >
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && <div className="text-gray-400 text-2xl">{icon}</div>}
      </div>

      <div>
        <p className="text-2xl font-bold text-[#1B1F3B] mt-1">
          {value}
          {unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
        </p>
        {change && (
          <p className={`text-xs mt-1 ${changeColor}`}>
            {change}
          </p>
        )}
      </div>
    </div>
  );
};

export default QualityMetricCard;
