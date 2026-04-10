import { useState } from "react";
import { useStore } from "../store";
import {
  FileSpreadsheet,
  Edit3,
  Upload,
  Trash2,
  Plus,
  Users,
  X,
} from "lucide-react";

function getProjectColor(project) {
  if (!project) return "bg-slate-700/50 text-slate-400 border border-slate-600";

  const colors = [
    "bg-cyan-900/50 text-cyan-300 border border-cyan-700",
    "bg-purple-900/50 text-purple-300 border border-purple-700",
    "bg-emerald-900/50 text-emerald-300 border border-emerald-700",
    "bg-amber-900/50 text-amber-300 border border-amber-700",
    "bg-pink-900/50 text-pink-300 border border-pink-700",
    "bg-indigo-900/50 text-indigo-300 border border-indigo-700",
    "bg-rose-900/50 text-rose-300 border border-rose-700",
    "bg-orange-900/50 text-orange-300 border border-orange-700",
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
  const { people, addPeople, removePerson, updatePerson, addToast } =
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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Users className="text-cyan-400" size={28} />
              </div>
              People ({people.length})
            </h2>
            <p className="text-slate-400 mt-2">Manage your team members</p>
          </div>
          <button
            onClick={() => setSlideoutOpen(true)}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold flex items-center gap-2 transition-all shadow-lg shadow-cyan-600/30 hover:shadow-cyan-500/40"
          >
            <Plus size={20} />
            Add People
          </button>
        </div>
      </div>

      {/* People List - Full Height */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6 flex-1 overflow-hidden">
        {people.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Users className="mb-4 text-slate-600" size={56} />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">
              No People Yet
            </h3>
            <p className="text-slate-500">Click "Add People" to get started</p>
          </div>
        ) : (
          <div className="space-y-2 h-full overflow-y-auto pr-2">
            {[...people]
              .sort((a, b) => a.order - b.order)
              .map((person) => {
                const titleColors = {
                  lead: "bg-purple-900/50 text-purple-300 border border-purple-700",
                  senior: "bg-blue-900/50 text-blue-300 border border-blue-700",
                  intermediate:
                    "bg-emerald-900/50 text-emerald-300 border border-emerald-700",
                  junior:
                    "bg-slate-700/50 text-slate-300 border border-slate-600",
                  external:
                    "bg-orange-900/50 text-orange-300 border border-orange-700",
                };

                return (
                  <div
                    key={person.id}
                    className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-all border border-slate-600"
                  >
                    <input
                      type="text"
                      value={person.name}
                      onChange={(e) =>
                        updatePerson(person.id, { name: e.target.value })
                      }
                      className="w-48 p-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      placeholder="Name"
                    />

                    <select
                      value={person.title}
                      onChange={(e) =>
                        updatePerson(person.id, { title: e.target.value })
                      }
                      className="w-40 p-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
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
                      className="w-40 p-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      placeholder="Project"
                    />

                    <div className="flex-1"></div>

                    <div className="flex items-center gap-2">
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
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-all font-medium flex items-center gap-2 shadow-lg shadow-rose-600/30 hover:shadow-rose-500/40"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
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
          <div className="fixed top-0 right-0 h-full w-[600px] bg-slate-800 border-l border-slate-700 shadow-2xl z-50 overflow-y-auto animate-slideIn">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                  <Plus size={24} className="text-cyan-400" />
                  Add People
                </h3>
                <button
                  onClick={() => setSlideoutOpen(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="text-slate-400" size={24} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b border-slate-700">
                <button
                  onClick={() => setActiveTab("csv")}
                  className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
                    activeTab === "csv"
                      ? "border-b-2 border-cyan-500 text-cyan-400"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  <FileSpreadsheet size={20} />
                  CSV Import
                </button>
                <button
                  onClick={() => setActiveTab("manual")}
                  className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
                    activeTab === "manual"
                      ? "border-b-2 border-cyan-500 text-cyan-400"
                      : "text-slate-400 hover:text-slate-300"
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
                    <label className="block text-sm font-medium mb-3 text-slate-300">
                      Upload CSV file or paste CSV data:
                    </label>
                    <div className="mb-3">
                      <label className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-cyan-500 hover:bg-cyan-950/20 transition-all">
                        <Upload className="mr-2 text-cyan-400" size={20} />
                        <span className="text-slate-300 font-medium">
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
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg font-mono text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      rows="12"
                      placeholder="name,level,project&#10;Alice,senior,ProjectA&#10;Bob,intermediate,ProjectA&#10;Charlie,lead,ProjectB"
                    />
                  </div>

                  <div className="bg-cyan-950/30 border border-cyan-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-cyan-300 mb-2 flex items-center gap-2">
                      <FileSpreadsheet size={18} />
                      Format:
                    </h4>
                    <p className="text-sm text-cyan-200 font-mono mb-2">
                      name,level,project
                    </p>
                    <p className="text-xs text-cyan-300/80 mb-1">
                      Levels: <span className="font-semibold">junior</span>,{" "}
                      <span className="font-semibold">intermediate</span>,{" "}
                      <span className="font-semibold">senior</span>,{" "}
                      <span className="font-semibold">lead</span>,{" "}
                      <span className="font-semibold">external</span>
                    </p>
                    <p className="text-xs text-cyan-300/80">
                      💡 People on the same project will be auto-mapped for
                      reviews
                    </p>
                  </div>

                  <button
                    onClick={handleCSVImport}
                    disabled={!csvText.trim()}
                    className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all font-semibold text-lg flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 hover:shadow-cyan-500/40"
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
                    <label className="block text-sm font-medium mb-3 text-slate-300">
                      Add Names (one per line):
                    </label>
                    <textarea
                      value={namesText}
                      onChange={(e) => setNamesText(e.target.value)}
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg font-mono text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      rows="10"
                      placeholder="Alice&#10;Bob&#10;Charlie"
                    />
                  </div>

                  <div className="flex gap-4 items-center">
                    <label className="text-sm font-medium text-slate-300">
                      Default Title:
                    </label>
                    <select
                      value={selectedTitle}
                      onChange={(e) => setSelectedTitle(e.target.value)}
                      className="flex-1 p-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
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
                    className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all font-semibold text-lg flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 hover:shadow-cyan-500/40"
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
    </div>
  );
}
