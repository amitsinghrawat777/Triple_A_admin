import { useTheme } from '../context/ThemeContext';

export const TableRowSkeleton = () => {
  const { isDarkMode } = useTheme();
  return (
    <tr className={`animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className={`h-10 w-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
          <div className="ml-4">
            <div className={`h-4 w-24 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
            <div className={`h-3 w-32 rounded mt-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`h-4 w-20 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`h-4 w-24 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`h-4 w-16 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className={`h-4 w-20 rounded ml-auto ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
      </td>
    </tr>
  );
};

export const StatCardSkeleton = () => {
  const { isDarkMode } = useTheme();
  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow rounded-lg animate-pulse`}>
      <div className="p-5">
        <div className="flex items-center">
          <div className={`h-12 w-12 rounded-md ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
          <div className="ml-5 w-full">
            <div className={`h-4 w-24 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
            <div className={`mt-2 h-6 w-16 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProfileSkeleton = () => {
  const { isDarkMode } = useTheme();
  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden animate-pulse`}>
      <div className="p-6">
        <div className="flex flex-col items-center">
          <div className={`h-32 w-32 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
          <div className={`mt-4 h-6 w-48 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
          <div className={`mt-2 h-4 w-32 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
        </div>
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className={`h-4 w-24 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
              <div className={`h-4 w-full rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const MembershipCardSkeleton = () => {
  const { isDarkMode } = useTheme();
  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden animate-pulse`}>
      <div className="p-6">
        <div className={`h-6 w-48 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
        <div className="mt-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-12 w-full rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const PaymentHistorySkeleton = () => {
  const { isDarkMode } = useTheme();
  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden animate-pulse`}>
      <div className="p-6">
        <div className={`h-6 w-48 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
        <div className="mt-4">
          <div className={`h-10 w-full rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
          {[1, 2, 3].map((i) => (
            <div key={i} className={`mt-2 h-12 w-full rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}; 