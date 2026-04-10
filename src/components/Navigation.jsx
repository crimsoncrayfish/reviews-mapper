import { BarChart3, Users } from "lucide-react";

export default function Navigation({
  currentPage,
  setCurrentPage,
  peopleCount,
}) {
  const isPeoplePage = currentPage === "people";
  const isMatrixPage = currentPage === "matrix";

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-3 sm:px-6 py-3 sm:py-4 sticky top-0 z-50 shadow-xl transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center min-w-0">
          <div
            className="inline-flex items-center gap-1 border-b border-gray-200 dark:border-slate-700/80"
            role="tablist"
            aria-label="App pages"
          >
            <button
              onClick={() => setCurrentPage("people")}
              role="tab"
              aria-selected={isPeoplePage}
              className={`px-2 sm:px-3 py-2 font-medium transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base border-b-2 -mb-px ${
                isPeoplePage
                  ? "text-gray-900 dark:text-slate-100 border-cyan-500 dark:border-cyan-400"
                  : "text-gray-500 dark:text-slate-400 border-transparent hover:text-gray-700 dark:hover:text-slate-200"
              }`}
            >
              <Users size={16} />
              People
              {peopleCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isPeoplePage
                      ? "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-200"
                      : "bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300"
                  }`}
                >
                  {peopleCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentPage("matrix")}
              role="tab"
              aria-selected={isMatrixPage}
              className={`px-2 sm:px-3 py-2 font-medium transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base border-b-2 -mb-px ${
                isMatrixPage
                  ? "text-gray-900 dark:text-slate-100 border-cyan-500 dark:border-cyan-400"
                  : "text-gray-500 dark:text-slate-400 border-transparent hover:text-gray-700 dark:hover:text-slate-200"
              }`}
            >
              <BarChart3 size={16} />
              Matrix
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 sm:gap-3 flex-shrink-0">
          <h1 className="hidden sm:block text-lg font-bold text-gray-900 dark:text-slate-100 text-right">
            Review Coordination
          </h1>
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <BarChart3 className="text-cyan-500 dark:text-cyan-400" size={20} />
          </div>
        </div>
      </div>
    </nav>
  );
}
