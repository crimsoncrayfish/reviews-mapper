import { useState, useRef } from "react";
import { useStore } from "../store";
import * as XLSX from "xlsx";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Check,
  Circle,
  Lock,
  GripVertical,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Maximize2,
  Minimize2,
  Flag,
  FileSpreadsheet,
  ArrowLeftRight,
  Search,
  X,
  Info,
  Settings,
  Sun,
  Moon,
  Filter,
  Tag,
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

function ProjectBadge({ project }) {
  if (!project) return null;

  const colorClass = getProjectColor(project);

  return (
    <span
      className={`px-2 py-0.5 rounded-md text-xs font-semibold ${colorClass} whitespace-nowrap`}
    >
      {project}
    </span>
  );
}

function DraggableRowHeader({
  person,
  compact,
  isHighlighted,
  onToggleFlag,
  showTags,
}) {
  const { addToast } = useStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `row-${person.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const titleColors = {
    lead: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700",
    senior: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700",
    intermediate:
      "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700",
    junior: "bg-gray-100 dark:bg-slate-700/50 text-gray-700 dark:text-slate-300 border border-gray-300 dark:border-slate-600",
    external: "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700",
  };

  const handleNameClick = (e) => {
    e.stopPropagation();
    onToggleFlag(person.id);
    addToast(
      `${person.name} ${person.flagged ? "unflagged" : "flagged"}`,
      person.flagged ? "success" : "warning",
    );
  };

  return (
    <td
      ref={setNodeRef}
      style={style}
      className={`border ${person.flagged ? "border-rose-400 dark:border-rose-500" : "border-gray-300 dark:border-slate-600"} ${compact ? "px-1 py-0.5" : "p-3"} bg-gradient-to-b ${
        person.flagged
          ? "from-rose-200 to-rose-300 dark:from-rose-900/50 dark:to-rose-800/50"
          : "from-gray-200 to-gray-300 dark:from-slate-800 dark:to-slate-700"
      } font-semibold cursor-move hover:from-gray-300 hover:to-gray-400 dark:hover:from-slate-700 dark:hover:to-slate-600 ${compact ? "min-w-[50px]" : "min-w-[120px]"} transition-all group sticky left-0 z-10 relative ${
        isHighlighted ? "ring-2 ring-cyan-500/50 ring-inset" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <div className={`flex items-center ${compact ? "gap-0.5" : "gap-2"}`}>
        <GripVertical
          className={`text-gray-400 dark:text-slate-500 ${compact ? "flex-shrink-0" : ""}`}
          size={compact ? 12 : 18}
        />
        <div className="flex flex-col min-w-0 flex-1">
          <div
            className={`font-semibold ${person.flagged ? "text-rose-500 dark:text-rose-300" : "text-gray-900 dark:text-slate-100"} ${compact ? "text-xs leading-tight" : ""} cursor-pointer hover:underline flex items-center gap-1`}
            onClick={handleNameClick}
          >
            {person.flagged && (
              <Flag
                size={compact ? 10 : 14}
                className="text-rose-500 dark:text-rose-400 fill-rose-500 dark:fill-rose-400"
              />
            )}
            {person.name}
          </div>
          {!compact && showTags && (
            <div className="flex gap-2 items-center flex-wrap mt-1.5">
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-semibold ${titleColors[person.title]}`}
              >
                {person.title}
              </span>
              <ProjectBadge project={person.project} />
            </div>
          )}
        </div>
      </div>
      {compact && showTags && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-1 hidden group-hover:flex flex-row gap-1.5 items-center bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg px-2 py-1.5 shadow-xl z-50 pointer-events-none whitespace-nowrap">
          <span
            className={`px-2 py-0.5 rounded-md text-xs font-semibold ${titleColors[person.title]}`}
          >
            {person.title}
          </span>
          <ProjectBadge project={person.project} />
        </div>
      )}
    </td>
  );
}

function DraggableColumnHeader({
  person,
  compact,
  isHighlighted,
  onToggleFlag,
  showTags,
}) {
  const { addToast } = useStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `col-${person.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const titleColors = {
    lead: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700",
    senior: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700",
    intermediate:
      "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700",
    junior: "bg-gray-100 dark:bg-slate-700/50 text-gray-700 dark:text-slate-300 border border-gray-300 dark:border-slate-600",
    external: "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700",
  };

  const handleNameClick = (e) => {
    e.stopPropagation();
    onToggleFlag(person.id);
    addToast(
      `${person.name} ${person.flagged ? "unflagged" : "flagged"}`,
      person.flagged ? "success" : "warning",
    );
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      className={`border ${person.flagged ? "border-rose-400 dark:border-rose-500" : "border-gray-300 dark:border-slate-600"} ${compact ? "px-1 py-0.5" : "p-3"} bg-gradient-to-b ${
        person.flagged
          ? "from-rose-100 to-rose-200 dark:from-rose-900/50 dark:to-rose-800/50"
          : "from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700"
      } font-semibold cursor-move hover:from-gray-200 hover:to-gray-300 dark:hover:from-slate-700 dark:hover:to-slate-600 ${compact ? "min-w-[50px]" : "min-w-[120px]"} transition-all group sticky top-0 z-20 relative ${
        isHighlighted ? "ring-2 ring-cyan-500/50 ring-inset" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <div
        className={`flex flex-col items-center ${compact ? "gap-0" : "gap-2"}`}
      >
        <GripVertical className="text-gray-400 dark:text-slate-500" size={compact ? 8 : 14} />
        <div
          className={`font-semibold ${person.flagged ? "text-rose-500 dark:text-rose-300" : "text-gray-900 dark:text-slate-100"} ${compact ? "text-xs leading-tight" : "text-sm"} text-center cursor-pointer hover:underline flex flex-col items-center gap-0.5`}
          onClick={handleNameClick}
        >
          {person.flagged && (
            <Flag
              size={compact ? 8 : 12}
              className="text-rose-500 dark:text-rose-400 fill-rose-500 dark:fill-rose-400"
            />
          )}
          <span>{person.name}</span>
        </div>
        {!compact && showTags && (
          <div className="flex flex-col gap-1.5 items-center">
            <span
              className={`px-2 py-0.5 rounded-md text-xs font-semibold ${titleColors[person.title]}`}
            >
              {person.title}
            </span>
            <ProjectBadge project={person.project} />
          </div>
        )}
      </div>
      {compact && showTags && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:flex flex-col gap-1 items-center bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg px-2 py-1.5 shadow-xl z-50 pointer-events-none whitespace-nowrap">
          <span
            className={`px-2 py-0.5 rounded-md text-xs font-semibold ${titleColors[person.title]}`}
          >
            {person.title}
          </span>
          <ProjectBadge project={person.project} />
        </div>
      )}
    </th>
  );
}
function GridCell({
  reviewer,
  reviewee,
  compact,
  onSingleClick,
  onDoubleClick,
  hoveredCell,
  onHover,
}) {
  const { hasRelationship, removeRelationship } = useStore();
  const clickTimerRef = useRef(null);
  const isSelfReview = reviewer.id === reviewee.id;
  const isChecked = isSelfReview || hasRelationship(reviewer.id, reviewee.id);
  const isMutual =
    !isSelfReview && isChecked && hasRelationship(reviewee.id, reviewer.id);

  const sameProject = reviewer.project && reviewer.project === reviewee.project;

  const isInHoveredRow = hoveredCell && hoveredCell.reviewerId === reviewer.id;
  const isInHoveredColumn =
    hoveredCell && hoveredCell.revieweeId === reviewee.id;
  const isHoveredCell =
    hoveredCell &&
    hoveredCell.reviewerId === reviewer.id &&
    hoveredCell.revieweeId === reviewee.id;

  const isReviewerFlagged = reviewer.flagged;
  const isRevieweeFlagged = reviewee.flagged;

  const iconSize = compact ? 20 : 28;

  const handleClick = () => {
    if (isChecked) {
      removeRelationship(reviewer.id, reviewee.id);
      return;
    }

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      onDoubleClick(reviewer, reviewee);
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null;
        onSingleClick(reviewer, reviewee);
      }, 250);
    }
  };

  if (isSelfReview) {
    return (
      <td
        className={`border ${isReviewerFlagged || isRevieweeFlagged ? "border-rose-500/50 dark:border-rose-500/50" : "border-gray-300 dark:border-slate-600"} ${compact ? "p-0.5" : "p-3"} text-center transition-colors ${
          isInHoveredRow || isInHoveredColumn
            ? "!bg-gray-200 dark:!bg-slate-700/50"
            : isReviewerFlagged || isRevieweeFlagged
              ? "bg-rose-100 dark:bg-rose-900/20"
              : "bg-gray-100 dark:bg-slate-800/50"
        }`}
        onMouseEnter={() => onHover(reviewer.id, reviewee.id)}
        onMouseLeave={() => onHover(null, null)}
      >
        <Lock className="text-gray-400 dark:text-slate-600 mx-auto" size={iconSize} />
      </td>
    );
  }

  return (
    <td
      className={`border ${isReviewerFlagged || isRevieweeFlagged ? "border-rose-500/50 dark:border-rose-500/50" : "border-gray-300 dark:border-slate-600"} ${compact ? "p-0.5" : "p-3"} text-center cursor-pointer transition-all duration-150 ${
        isHoveredCell
          ? "ring-2 ring-cyan-500/50 ring-inset"
          : ""
      } ${
        isInHoveredRow || isInHoveredColumn
          ? "!bg-gray-200 dark:!bg-slate-700/70"
          : isReviewerFlagged || isRevieweeFlagged
            ? "bg-rose-100 dark:bg-rose-900/20 hover:bg-rose-200 dark:hover:bg-rose-800/30"
            : sameProject
              ? "bg-cyan-50 dark:bg-cyan-950/50 hover:bg-cyan-100 dark:hover:bg-cyan-900/50"
              : "bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
      }`}
      onClick={handleClick}
      onMouseEnter={() => onHover(reviewer.id, reviewee.id)}
      onMouseLeave={() => onHover(null, null)}
    >
      <div className="flex items-center justify-center transition-all duration-200 hover:scale-125">
        {isChecked ? (
          isMutual ? (
            <ArrowLeftRight
              className="text-cyan-500 dark:text-cyan-400"
              size={iconSize}
              strokeWidth={2.5}
            />
          ) : (
            <Check
              className="text-emerald-500 dark:text-emerald-400"
              size={iconSize}
              strokeWidth={3}
            />
          )
        ) : (
          <Circle className="text-gray-300 dark:text-slate-600" size={iconSize} strokeWidth={2} />
        )}
      </div>
    </td>
  );
}

function calculateStats(person, people, relationships) {
  const reviewsReceived =
    relationships.filter(
      (r) => r.revieweeId === person.id && r.reviewerId !== person.id,
    ).length + 1;

  const reviewsDoing =
    relationships.filter(
      (r) => r.reviewerId === person.id && r.revieweeId !== person.id,
    ).length + 1;

  const seniorReviews = relationships.filter((r) => {
    if (r.revieweeId !== person.id || r.reviewerId === person.id) return false;
    const reviewer = people.find((p) => p.id === r.reviewerId);
    return (
      reviewer && (reviewer.title === "senior" || reviewer.title === "lead")
    );
  }).length;

  return { reviewsReceived, reviewsDoing, seniorReviews };
}

export default function ReviewGrid({
  searchQuery = "",
  setSearchQuery = () => {},
}) {
  const {
    people,
    relationships,
    reorderPeople,
    compactMode,
    toggleCompactMode,
    addMutualRelationship,
    addRelationship,
    addToast,
    togglePersonFlag,
    theme,
    toggleTheme,
  } = useStore();
  const [hoveredCell, setHoveredCell] = useState(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedTitles, setSelectedTitles] = useState(new Set());
  const [selectedProjects, setSelectedProjects] = useState(new Set());
  const [showStatsColumn, setShowStatsColumn] = useState(true);
  const [showTags, setShowTags] = useState(true);

  const exportToExcel = () => {
    if (people.length === 0) return;

    const sortedPeople = [...people].sort((a, b) => a.order - b.order);

    const calculateStats = (person) => {
      const reviewsReceived =
        relationships.filter(
          (r) => r.revieweeId === person.id && r.reviewerId !== person.id,
        ).length + 1;
      const reviewsDoing =
        relationships.filter(
          (r) => r.reviewerId === person.id && r.revieweeId !== person.id,
        ).length + 1;
      const seniorReviews = relationships.filter((r) => {
        if (r.revieweeId !== person.id || r.reviewerId === person.id)
          return false;
        const reviewer = people.find((p) => p.id === r.reviewerId);
        return (
          reviewer && (reviewer.title === "senior" || reviewer.title === "lead")
        );
      }).length;
      return { reviewsReceived, reviewsDoing, seniorReviews };
    };

    const data = [];
    const headerRow = [
      "Reviewer → / ↓ Reviewee",
      ...sortedPeople.map((p) => `${p.name} (${p.title})`),
      "Received",
      "Doing",
      "Senior/Lead",
    ];
    data.push(headerRow);

    sortedPeople.forEach((reviewer) => {
      const row = [`${reviewer.name} (${reviewer.title})`];
      sortedPeople.forEach((reviewee) => {
        if (reviewer.id === reviewee.id) {
          row.push("x");
        } else {
          const hasReview = relationships.some(
            (r) => r.reviewerId === reviewer.id && r.revieweeId === reviewee.id,
          );
          row.push(hasReview ? "x" : "");
        }
      });
      const stats = calculateStats(reviewer);
      row.push(stats.reviewsReceived, stats.reviewsDoing, stats.seniorReviews);
      data.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    const colWidths = [{ wch: 25 }];
    sortedPeople.forEach(() => colWidths.push({ wch: 20 }));
    colWidths.push({ wch: 10 }, { wch: 10 }, { wch: 12 });
    ws["!cols"] = colWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Review Matrix");
    XLSX.writeFile(wb, "review-matrix.xlsx");
    addToast("Exported review matrix to Excel!", "success");
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const sortedPeople = [...people].sort((a, b) => a.order - b.order);
  const filteredRowPeople = sortedPeople.filter((person) => {
    // Search filter
    if (searchQuery.trim() && !person.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Title filter
    if (selectedTitles.size > 0 && !selectedTitles.has(person.title)) {
      return false;
    }
    // Project filter
    if (selectedProjects.size > 0) {
      if (!person.project || !selectedProjects.has(person.project)) {
        return false;
      }
    }
    return true;
  });

  function handleDragEnd(event) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeId = active.id.replace(/^(row-|col-)/, "");
      const overId = over.id.replace(/^(row-|col-)/, "");

      const oldIndex = sortedPeople.findIndex((p) => p.id === activeId);
      const newIndex = sortedPeople.findIndex((p) => p.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(sortedPeople, oldIndex, newIndex);
        reorderPeople(reordered);
      }
    }
  }

  function handleSingleClick(reviewer, reviewee) {
    addRelationship(reviewer.id, reviewee.id);
    addToast(`${reviewer.name} → ${reviewee.name}`, "success");
  }

  function handleDoubleClick(reviewer, reviewee) {
    addMutualRelationship(reviewer.id, reviewee.id);
    addToast(`${reviewer.name} ↔ ${reviewee.name} (mutual)`, "success");
  }

  // Get unique titles and projects
  const uniqueTitles = [...new Set(people.map(p => p.title))].sort();
  const uniqueProjects = [...new Set(people.map(p => p.project).filter(Boolean))].sort();

  // Toggle filter selections
  const toggleTitle = (title) => {
    const newSet = new Set(selectedTitles);
    if (newSet.has(title)) {
      newSet.delete(title);
    } else {
      newSet.add(title);
    }
    setSelectedTitles(newSet);
  };

  const toggleProject = (project) => {
    const newSet = new Set(selectedProjects);
    if (newSet.has(project)) {
      newSet.delete(project);
    } else {
      newSet.add(project);
    }
    setSelectedProjects(newSet);
  };

  const clearFilters = () => {
    setSelectedTitles(new Set());
    setSelectedProjects(new Set());
  };

  const hasActiveFilters = selectedTitles.size > 0 || selectedProjects.size > 0;

  function handleCellHover(reviewerId, revieweeId) {
    if (reviewerId && revieweeId) {
      setHoveredCell({ reviewerId, revieweeId });
    } else {
      setHoveredCell(null);
    }
  }

  if (people.length === 0) {
    return (
      <div className="p-12 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl text-center">
        <BarChart3 className="mx-auto mb-4 text-gray-300 dark:text-slate-600" size={56} />
        <h3 className="text-xl font-semibold text-gray-500 dark:text-slate-300 mb-2">
          No People Yet
        </h3>
        <p className="text-gray-400 dark:text-slate-500">
          Add people on the People page to get started with review assignments
        </p>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-slate-800 overflow-hidden transition-colors ${
        compactMode ? "" : "border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl"
      }`}
    >
      {!compactMode && (
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-slate-700 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <BarChart3 className="text-cyan-500 dark:text-cyan-400" size={26} />
                </div>
                Review Matrix
              </h2>
              <button
                onClick={() => setShowHelpModal(true)}
                className="mt-2 text-sm text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 transition-colors flex items-center gap-2"
              >
                <Info size={16} className="text-cyan-500 dark:text-cyan-400" />
                How this works
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search rows..."
                  className="w-full pl-9 pr-8 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilterModal(true)}
                className={`p-2 rounded-lg border transition-all ${
                  hasActiveFilters
                    ? "bg-cyan-100 dark:bg-cyan-900/30 border-cyan-500 dark:border-cyan-600 text-cyan-600 dark:text-cyan-400"
                    : "bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
                title="Filter by tags"
              >
                <Filter size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {!compactMode && (
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
                  <button
                    onClick={() => {
                      exportToExcel();
                      setShowActionsMenu(false);
                    }}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-900 dark:text-slate-100 transition-all flex items-center gap-3 border-b border-gray-200 dark:border-slate-700 text-sm font-medium"
                  >
                    <FileSpreadsheet size={16} className="text-blue-500 dark:text-blue-400" />
                    Export Excel
                  </button>
                  <button
                    onClick={() => {
                      toggleCompactMode();
                      setShowActionsMenu(false);
                    }}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-900 dark:text-slate-100 transition-all flex items-center gap-3 border-b border-gray-200 dark:border-slate-700 text-sm font-medium"
                  >
                    <Minimize2 size={16} className="text-gray-500 dark:text-slate-400" />
                    Compact View
                  </button>
                  <button
                    onClick={() => {
                      setShowStatsColumn(!showStatsColumn);
                      setShowActionsMenu(false);
                    }}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-900 dark:text-slate-100 transition-all flex items-center gap-3 border-b border-gray-200 dark:border-slate-700 text-sm font-medium"
                  >
                    <BarChart3
                      size={16}
                      className={
                        showStatsColumn
                          ? "text-amber-500 dark:text-amber-400"
                          : "text-gray-400 dark:text-slate-500"
                      }
                    />
                    Statistics
                  </button>
                  <button
                    onClick={() => {
                      setShowTags(!showTags);
                      setShowActionsMenu(false);
                    }}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-900 dark:text-slate-100 transition-all flex items-center gap-3 border-b border-gray-200 dark:border-slate-700 text-sm font-medium"
                  >
                    <Tag
                      size={16}
                      className={
                        showTags
                          ? "text-cyan-500 dark:text-cyan-400"
                          : "text-gray-400 dark:text-slate-500"
                      }
                    />
                    Tags
                  </button>
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
      )}

      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <Filter size={18} className="text-cyan-500 dark:text-cyan-400" />
                Filter People
              </h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-1.5 rounded-md text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title Filter */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">By Title</h4>
                <div className="flex flex-wrap gap-2">
                  {uniqueTitles.map((title) => (
                    <button
                      key={title}
                      onClick={() => toggleTitle(title)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedTitles.has(title)
                          ? "bg-cyan-500 text-white"
                          : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                      }`}
                    >
                      {title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Filter */}
              {uniqueProjects.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">By Project</h4>
                  <div className="flex flex-wrap gap-2">
                    {uniqueProjects.map((project) => (
                      <button
                        key={project}
                        onClick={() => toggleProject(project)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedProjects.has(project)
                            ? "bg-cyan-500 text-white"
                            : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                        }`}
                      >
                        {project}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Filter Summary */}
              {hasActiveFilters && (
                <div className="pt-3 border-t border-gray-200 dark:border-slate-700">
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Showing {filteredRowPeople.length} of {people.length} people
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-5">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-slate-100 rounded-lg font-semibold transition-all"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold transition-all"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6">
          <div className="w-full max-w-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <Info size={18} className="text-cyan-500 dark:text-cyan-400" />
                Matrix Help
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1.5 rounded-md text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-700 dark:text-slate-300">
              <p>Single-click creates a one-way review. Double-click creates a mutual review.</p>
              <div className="flex items-center gap-2">
                <Flag size={14} className="text-rose-500 dark:text-rose-400 fill-rose-500 dark:fill-rose-400" />
                <span>Click a name to flag a concern.</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock size={14} className="text-gray-400 dark:text-slate-500" />
                <span>Self-review is automatic and always locked.</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-cyan-100 dark:bg-cyan-950/50 border border-cyan-300 dark:border-cyan-900" />
                <span>Cells with this tint are same-project pairs.</span>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="mt-5 w-full px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {compactMode && (
        <div className="px-2 py-1 flex justify-between items-center gap-2 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowHelpModal(true)}
              className="px-2 py-1 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 rounded transition-all flex items-center gap-1 text-xs border border-gray-300 dark:border-slate-600"
              title="How this works"
            >
              <Info size={12} />
            </button>
            <button
              onClick={exportToExcel}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded transition-all flex items-center gap-1 text-xs shadow-lg shadow-blue-600/30"
              title="Export to Excel"
            >
              <FileSpreadsheet size={14} />
            </button>
            <button
              onClick={() => setShowStatsColumn(!showStatsColumn)}
              className={`px-2 py-1 rounded transition-all flex items-center gap-1 text-xs border ${
                showStatsColumn
                  ? "bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                  : "bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-500 dark:text-slate-400 border-gray-300 dark:border-slate-600"
              }`}
              title={showStatsColumn ? "Hide statistics" : "Show statistics"}
            >
              <BarChart3 size={12} />
            </button>
            <button
              onClick={() => setShowTags(!showTags)}
              className={`px-2 py-1 rounded transition-all flex items-center gap-1 text-xs border ${
                showTags
                  ? "bg-cyan-100 dark:bg-cyan-900/40 hover:bg-cyan-200 dark:hover:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700"
                  : "bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-500 dark:text-slate-400 border-gray-300 dark:border-slate-600"
              }`}
              title={showTags ? "Hide tags" : "Show tags"}
            >
              <Tag size={12} />
            </button>
          </div>
          <div className="relative flex-1 max-w-[180px]">
            <Search
              size={12}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter rows..."
              className="pl-6 pr-6 py-0.5 w-full bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400 text-xs focus:ring-1 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200"
              >
                <X size={10} />
              </button>
            )}
          </div>
          <button
            onClick={toggleCompactMode}
            className="px-2 py-1 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 rounded transition-all flex items-center gap-1 border border-gray-300 dark:border-slate-600 text-xs"
            title="Switch to comfortable view"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      )}

      <div
        className={`overflow-auto hide-scrollbar ${compactMode ? "max-h-[calc(100vh-40px)]" : "max-h-[calc(100vh-250px)]"}`}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="border-collapse w-full">
            <thead>
              <tr>
                <th
                  className={`border border-gray-300 dark:border-slate-600 ${compactMode ? "px-1 py-0.5" : "p-3"} bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 font-bold ${compactMode ? "text-xs leading-tight" : "text-sm"} sticky left-0 top-0 z-30`}
                >
                  <div className="text-gray-700 dark:text-slate-300">
                    {compactMode ? "→" : "Reviewee →"}
                  </div>
                  <div className="text-gray-700 dark:text-slate-300">
                    {compactMode ? "↓" : "↓ Reviewer"}
                  </div>
                </th>

                <SortableContext
                  items={sortedPeople.map((p) => `col-${p.id}`)}
                  strategy={horizontalListSortingStrategy}
                >
                  {sortedPeople.map((person) => (
                    <DraggableColumnHeader
                      key={person.id}
                      person={person}
                      compact={compactMode}
                      showTags={showTags}
                      isHighlighted={
                        hoveredCell && hoveredCell.revieweeId === person.id
                      }
                      onToggleFlag={togglePersonFlag}
                    />
                  ))}
                </SortableContext>

                {showStatsColumn && (
                  <th
                    className={`border border-gray-300 dark:border-slate-600 ${compactMode ? "px-1 py-0.5" : "p-3"} bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-950 font-bold sticky right-0 top-0 z-30`}
                  >
                    <div className="text-amber-700 dark:text-amber-300 flex items-center justify-center gap-1">
                      <BarChart3 size={compactMode ? 12 : 18} />
                      {!compactMode && "Statistics"}
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              <SortableContext
                items={sortedPeople.map((p) => `row-${p.id}`)}
                strategy={verticalListSortingStrategy}
              >
                {filteredRowPeople.map((reviewer) => {
                  const stats = calculateStats(reviewer, people, relationships);

                  return (
                    <tr key={reviewer.id}>
                      <DraggableRowHeader
                        person={reviewer}
                        compact={compactMode}
                        showTags={showTags}
                        isHighlighted={
                          hoveredCell && hoveredCell.reviewerId === reviewer.id
                        }
                        onToggleFlag={togglePersonFlag}
                      />

                      {sortedPeople.map((reviewee) => (
                        <GridCell
                          key={`${reviewer.id}-${reviewee.id}`}
                          reviewer={reviewer}
                          reviewee={reviewee}
                          compact={compactMode}
                          onSingleClick={handleSingleClick}
                          onDoubleClick={handleDoubleClick}
                          hoveredCell={hoveredCell}
                          onHover={handleCellHover}
                        />
                      ))}

                      {showStatsColumn && (
                        <td
                          className={`border border-gray-300 dark:border-slate-600 ${compactMode ? "px-1 py-0.5" : "p-3"} bg-amber-100 dark:bg-amber-950 sticky right-0 z-10`}
                        >
                          <div
                            className={`${compactMode ? "text-xs space-y-0" : "text-sm space-y-2"}`}
                          >
                            <div
                              className={`flex ${compactMode ? "justify-center" : "justify-between"} items-center ${compactMode ? "gap-0" : "gap-2"}`}
                            >
                              {!compactMode && (
                                <span className="font-medium text-gray-500 dark:text-slate-400">
                                  Received:
                                </span>
                              )}
                              <span
                                className={`font-bold text-cyan-600 dark:text-cyan-400 ${compactMode ? "text-xs leading-tight" : "text-base"}`}
                              >
                                {stats.reviewsReceived}
                              </span>
                            </div>
                            <div
                              className={`flex ${compactMode ? "justify-center" : "justify-between"} items-center ${compactMode ? "gap-0" : "gap-2"}`}
                            >
                              {!compactMode && (
                                <span className="font-medium text-gray-500 dark:text-slate-400">
                                  Doing:
                                </span>
                              )}
                              <span
                                className={`font-bold text-cyan-600 dark:text-cyan-400 ${compactMode ? "text-xs leading-tight" : "text-base"}`}
                              >
                                {stats.reviewsDoing}
                              </span>
                            </div>
                            <div
                              className={`flex ${compactMode ? "justify-center" : "justify-between"} items-center ${compactMode ? "gap-0.5" : "gap-2"} ${
                                stats.seniorReviews >= 1
                                  ? "text-emerald-500 dark:text-emerald-400"
                                  : "text-amber-500 dark:text-amber-400"
                              }`}
                            >
                              {!compactMode && (
                                <span className="font-medium">Senior/Lead:</span>
                              )}
                              <span
                                className={`font-bold flex items-center gap-0.5 ${compactMode ? "text-xs leading-tight" : "text-base"}`}
                              >
                                {stats.seniorReviews}
                                {stats.seniorReviews === 0 ? (
                                  <AlertCircle size={compactMode ? 10 : 16} />
                                ) : (
                                  <CheckCircle size={compactMode ? 10 : 16} />
                                )}
                              </span>
                            </div>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </SortableContext>
            </tbody>
          </table>
        </DndContext>
      </div>
    </div>
  );
}
