import { KpiCardProps } from '@/types';

export const KpiCard: React.FC<KpiCardProps> = ({ label, value, hint }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
          {hint && (
            <p className="text-xs text-gray-500 mt-1">{hint}</p>
          )}
        </div>
      </div>
    </div>
  );
};
