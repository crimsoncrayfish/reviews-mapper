import { BarChart3, Users, Download, FileSpreadsheet } from "lucide-react";

export default function Navigation({
  currentPage,
  setCurrentPage,
  onExportCSV,
  onExportExcel,
  peopleCount,
}) {
  return (
    <nav className="bg-slate-900 border-b border-slate-700 px-6 py-4 sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <BarChart3 className="text-cyan-400" size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-100">
            Review Coordination
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage("people")}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
              currentPage === "people"
                ? "bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/30"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            }`}
          >
            <Users size={18} />
            People
            {peopleCount > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  currentPage === "people"
                    ? "bg-slate-900 text-cyan-400"
                    : "bg-slate-700 text-slate-300"
                }`}
              >
                {peopleCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentPage("matrix")}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
              currentPage === "matrix"
                ? "bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/30"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            }`}
          >
            <BarChart3 size={18} />
            Matrix
          </button>

          {peopleCount > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={onExportCSV}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40"
              >
                <Download size={18} />
                CSV
              </button>
              <button
                onClick={onExportExcel}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40"
              >
                <FileSpreadsheet size={18} />
                Excel
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
