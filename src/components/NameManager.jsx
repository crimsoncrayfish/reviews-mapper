import { useState } from "react";
import { useStore } from "../store";
import {
  FileSpreadsheet,
  Edit3,
  Upload,
  Trash2,
  Plus,
  Users,
  Download,
  X,
  Settings,
  Sun,
  Moon,
} from "lucide-react";

function getProjectColor(project) {
  if (!project) return "bg-gray-100 dark:bg-slate-700/50 text-gray-600 dark:text-slate-400 border border-gray-300 dark:border-slate-600";

  const colors = [
    "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700",
    "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700",
    "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700",
    "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700",
    "bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300 border border-pink-300 dark:border-pink-700",
    "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700",
    "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700",
    "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700",
  ];

  const hash = project
    .split("")
    .reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return colors[hash % colors.length];
}

export default function NameManager() {
  const [slideoutOpen, setSlideoutOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("csv");
  const [csvText, setCSVText] = useState("");
  const [namesText, setNamesText] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("intermediate");
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const { people, addPeople, removePerson, updatePerson, addToast, theme, toggleTheme } =
    useStore();

  const handleCSVImport = () => {
    try {
      const lines = csvText.trim().split("\n");
      const peopleData = [];
      const errors = [];

      lines.forEach((line, index) => {
        if (line.trim() === "") return;

        const [name, level, project] = line.split(",").map((s) => s.trim());

        if (!name) {
          errors.push(`Line ${index + 1}: Name is required`);
          return;
        }

        const validLevels = [
          "junior",
          "intermediate",
          "senior",
          "lead",
          "external",
        ];
        if (!validLevels.includes(level?.toLowerCase())) {
          errors.push(
            `Line ${index + 1}: Invalid level "${level}" (must be junior, intermediate, senior, lead, or external)`,
          );
          return;
        }

        peopleData.push({
          name,
          title: level.toLowerCase(),
          project: project || "",
        });
      });

      if (errors.length > 0) {
        addToast(errors.join(" • "), "error");
        return;
      }

      if (peopleData.length === 0) {
        addToast("No valid data to import", "warning");
        return;
      }

      addPeople(peopleData);
      setCSVText("");
      setSlideoutOpen(false);
      addToast(`Successfully imported ${peopleData.length} people!`, "success");
    } catch (error) {
      addToast("Failed to parse CSV: " + error.message, "error");
    }
  };

  const handleManualAdd = () => {
    const names = namesText
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (names.length > 0) {
      const peopleData = names.map((name) => ({
        name,
        title: selectedTitle,
        project: "",
      }));
      addPeople(peopleData);
      setNamesText("");
      setSlideoutOpen(false);
      addToast(`Successfully added ${names.length} people!`, "success");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCSVText(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleExportCSV = () => {
    if (people.length === 0) {
      addToast("No people to export", "warning");
      return;
    }

    const csvContent = [...people]
      .sort((a, b) => a.order - b.order)
      .map((p) => `${p.name},${p.title},${p.project || ""}`)
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "review-mappings.csv";
    a.click();
    URL.revokeObjectURL(url);
    addToast(`Exported ${people.length} people to CSV!`, "success");
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl p-4 sm:p-6 mb-4 sm:mb-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Users className="text-cyan-500 dark:text-cyan-400" size={28} />
              </div>
              People ({people.length})
            </h2>
            <p className="text-gray-600 dark:text-slate-400 mt-2">Manage your team members</p>
          </div>
          <button
            onClick={() => setSlideoutOpen(true)}
            className="w-full sm:w-auto justify-center px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold flex items-center gap-2 transition-all shadow-lg shadow-cyan-600/30 hover:shadow-cyan-500/40"
          >
            <Plus size={20} />
            Add People
          </button>
        </div>
      </div>

      {/* People List - Full Height */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl p-3 sm:p-6 flex-1 overflow-hidden transition-colors">
        {people.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-slate-500">
            <Users className="mb-4 text-gray-300 dark:text-slate-600" size={56} />
            <h3 className="text-xl font-semibold text-gray-500 dark:text-slate-400 mb-2">
              No People Yet
            </h3>
            <p className="text-gray-400 dark:text-slate-500">Click "Add People" to get started</p>
          </div>
        ) : (
          <div className="space-y-2 h-full overflow-y-auto pr-2">
            {[...people]
              .sort((a, b) => a.order - b.order)
              .map((person) => {
                const titleColors = {
                  lead: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700",
                  senior: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700",
                  intermediate:
                    "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700",
                  junior:
                    "bg-gray-100 dark:bg-slate-700/50 text-gray-700 dark:text-slate-300 border border-gray-300 dark:border-slate-600",
                  external:
                    "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700",
                };

                return (
                  <div
                    key={person.id}
                    className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-all border border-gray-200 dark:border-slate-600"
                  >
                    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-3 xl:items-center">
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_160px_160px] gap-2 w-full">
                        <input
                          type="text"
                          value={person.name}
                          onChange={(e) =>
                            updatePerson(person.id, { name: e.target.value })
                          }
                          className="w-full min-w-0 p-2 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                          placeholder="Name"
                        />

                        <select
                          value={person.title}
                          onChange={(e) =>
                            updatePerson(person.id, { title: e.target.value })
                          }
                          className="w-full p-2 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-lg text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        >
                          <option value="junior">Junior</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="senior">Senior</option>
                          <option value="lead">Lead</option>
                          <option value="external">External</option>
                        </select>

                        <input
                          type="text"
                          value={person.project || ""}
                          onChange={(e) =>
                            updatePerson(person.id, { project: e.target.value })
                          }
                          className="w-full p-2 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all sm:col-span-2 xl:col-span-1"
                          placeholder="Project"
                        />
                      </div>

                      <div className="flex items-center gap-2 flex-wrap xl:flex-nowrap xl:w-[320px] xl:justify-end">
                        <span
                          className={`px-3 py-1 rounded-md text-xs font-semibold ${titleColors[person.title]} whitespace-nowrap`}
                        >
                          {person.title}
                        </span>

                        {person.project && (
                          <span
                            className={`px-3 py-1 rounded-md text-xs font-semibold ${getProjectColor(person.project)} whitespace-nowrap`}
                          >
                            {person.project}
                          </span>
                        )}

                        <button
                          onClick={() => removePerson(person.id)}
                          className="w-full sm:w-auto justify-center px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-all font-medium flex items-center gap-2 shadow-lg shadow-rose-600/30 hover:shadow-rose-500/40"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Slideout Panel */}
      {slideoutOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={() => setSlideoutOpen(false)}
          />

          {/* Slideout */}
          <div className="fixed top-0 right-0 h-full w-full sm:w-[600px] bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 shadow-2xl z-50 overflow-y-auto animate-slideIn">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                  <Plus size={24} className="text-cyan-500 dark:text-cyan-400" />
                  Add People
                </h3>
                <button
                  onClick={() => setSlideoutOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="text-gray-500 dark:text-slate-400" size={24} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-slate-700">
                <button
                  onClick={() => setActiveTab("csv")}
                  className={`flex-1 justify-center px-3 sm:px-6 py-3 font-semibold transition-all flex items-center gap-2 text-sm sm:text-base ${
                    activeTab === "csv"
                      ? "border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400"
                      : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                  }`}
                >
                  <FileSpreadsheet size={20} />
                  CSV Import
                </button>
                <button
                  onClick={() => setActiveTab("manual")}
                  className={`flex-1 justify-center px-3 sm:px-6 py-3 font-semibold transition-all flex items-center gap-2 text-sm sm:text-base ${
                    activeTab === "manual"
                      ? "border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400"
                      : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                  }`}
                >
                  <Edit3 size={20} />
                  Manual Entry
                </button>
              </div>

              {/* CSV Import Tab */}
              {activeTab === "csv" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-slate-300">
                      Upload CSV file or paste CSV data:
                    </label>
                    <div className="mb-3">
                      <label className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-950/20 transition-all">
                        <Upload className="mr-2 text-cyan-500 dark:text-cyan-400" size={20} />
                        <span className="text-gray-700 dark:text-slate-300 font-medium">
                          Choose CSV file
                        </span>
                        <input
                          type="file"
                          accept=".csv,text/csv"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <textarea
                      value={csvText}
                      onChange={(e) => setCSVText(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg font-mono text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      rows="12"
                      placeholder="name,level,project&#10;Alice,senior,ProjectA&#10;Bob,intermediate,ProjectA&#10;Charlie,lead,ProjectB"
                    />
                  </div>

                  <div className="bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-cyan-700 dark:text-cyan-300 mb-2 flex items-center gap-2">
                      <FileSpreadsheet size={18} />
                      Format:
                    </h4>
                    <p className="text-sm text-cyan-600 dark:text-cyan-200 font-mono mb-2">
                      name,level,project
                    </p>
                    <p className="text-xs text-cyan-700 dark:text-cyan-300/80 mb-1">
                      Levels: <span className="font-semibold">junior</span>,{" "}
                      <span className="font-semibold">intermediate</span>,{" "}
                      <span className="font-semibold">senior</span>,{" "}
                      <span className="font-semibold">lead</span>,{" "}
                      <span className="font-semibold">external</span>
                    </p>
                    <p className="text-xs text-cyan-700 dark:text-cyan-300/80">
                      💡 People on the same project will be auto-mapped for
                      reviews
                    </p>
                  </div>

                  <button
                    onClick={handleCSVImport}
                    disabled={!csvText.trim()}
                    className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:text-gray-500 dark:disabled:text-slate-500 disabled:cursor-not-allowed transition-all font-semibold text-lg flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 hover:shadow-cyan-500/40"
                  >
                    <Upload size={20} />
                    Import CSV Data
                  </button>
                </div>
              )}

              {/* Manual Entry Tab */}
              {activeTab === "manual" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-slate-300">
                      Add Names (one per line):
                    </label>
                    <textarea
                      value={namesText}
                      onChange={(e) => setNamesText(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg font-mono text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      rows="10"
                      placeholder="Alice&#10;Bob&#10;Charlie"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Default Title:
                    </label>
                    <select
                      value={selectedTitle}
                      onChange={(e) => setSelectedTitle(e.target.value)}
                      className="flex-1 p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    >
                      <option value="junior">Junior</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="senior">Senior</option>
                      <option value="lead">Lead</option>
                    </select>
                  </div>

                  <button
                    onClick={handleManualAdd}
                    disabled={!namesText.trim()}
                    className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:text-gray-500 dark:disabled:text-slate-500 disabled:cursor-not-allowed transition-all font-semibold text-lg flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 hover:shadow-cyan-500/40"
                  >
                    <Plus size={20} />
                    Add Names
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Floating Settings Menu */}
      <>
        {showActionsMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowActionsMenu(false)}
          />
        )}
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
          <div className="relative">
            {showActionsMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden min-w-[180px]">
                {people.length > 0 && (
                  <button
                    onClick={() => {
                      handleExportCSV();
                      setShowActionsMenu(false);
                    }}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-900 dark:text-slate-100 transition-all flex items-center gap-3 border-b border-gray-200 dark:border-slate-700 text-sm font-medium"
                  >
                    <Download size={16} className="text-emerald-500 dark:text-emerald-400" />
                    Export CSV
                  </button>
                )}
                <button
                  onClick={() => {
                    toggleTheme();
                    setShowActionsMenu(false);
                  }}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-900 dark:text-slate-100 transition-all flex items-center gap-3 text-sm font-medium"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun size={16} className="text-amber-500" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon size={16} className="text-gray-600" />
                      Dark Mode
                    </>
                  )}
                </button>
              </div>
            )}
            <button
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              className="p-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-full shadow-2xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-all text-gray-700 dark:text-slate-200"
              title="Actions"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </>
    </div>
  );
}
