export default function StatusBar() {
  return (
    <div className="flex justify-between items-center px-6 py-3 text-sm font-medium glass-surface">
      <span className="text-white font-semibold">9:41</span>
      <div className="flex items-center space-x-1">
        <div className="flex space-x-1">
          <div className="w-1 h-3 bg-white rounded-full"></div>
          <div className="w-1 h-3 bg-white rounded-full"></div>
          <div className="w-1 h-3 bg-white opacity-60 rounded-full"></div>
          <div className="w-1 h-3 bg-white opacity-30 rounded-full"></div>
        </div>
        <div className="w-6 h-3 border border-white rounded-sm ml-2">
          <div className="w-4 h-1 bg-white rounded-xs mx-auto mt-0.5"></div>
        </div>
      </div>
    </div>
  );
}
