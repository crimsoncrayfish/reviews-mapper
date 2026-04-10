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

function DraggableRowHeader({ person, compact, isHighlighted, onToggleFlag }) {
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
    lead: "bg-purple-900/50 text-purple-300 border border-purple-700",
    senior: "bg-blue-900/50 text-blue-300 border border-blue-700",
    intermediate:
      "bg-emerald-900/50 text-emerald-300 border border-emerald-700",
    junior: "bg-slate-700/50 text-slate-300 border border-slate-600",
    external: "bg-orange-900/50 text-orange-300 border border-orange-700",
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
      className={`border ${person.flagged ? "border-rose-500" : "border-slate-600"} ${compact ? "px-1 py-0.5" : "p-3"} bg-gradient-to-r ${
        person.flagged
          ? "from-rose-900/50 to-rose-800/50"
          : "from-slate-800 to-slate-700"
      } font-semibold cursor-move hover:from-slate-700 hover:to-slate-600 transition-all sticky left-0 z-10 group relative ${
        isHighlighted ? "ring-2 ring-cyan-500/50 ring-inset" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <div className={`flex items-center ${compact ? "gap-0.5" : "gap-2"}`}>
        <GripVertical
          className={`text-slate-500 ${compact ? "flex-shrink-0" : ""}`}
          size={compact ? 12 : 18}
        />
        <div className="flex flex-col min-w-0 flex-1">
          <div
            className={`font-semibold ${person.flagged ? "text-rose-300" : "text-slate-100"} ${compact ? "text-xs leading-tight" : ""} cursor-pointer hover:underline flex items-center gap-1`}
            onClick={handleNameClick}
          >
            {person.flagged && (
              <Flag
                size={compact ? 10 : 14}
                className="text-rose-400 fill-rose-400"
              />
            )}
            {person.name}
          </div>
          {!compact && (
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
      {compact && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-1 hidden group-hover:flex flex-row gap-1.5 items-center bg-slate-900 border border-slate-600 rounded-lg px-2 py-1.5 shadow-xl z-50 pointer-events-none whitespace-nowrap">
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
    lead: "bg-purple-900/50 text-purple-300 border border-purple-700",
    senior: "bg-blue-900/50 text-blue-300 border border-blue-700",
    intermediate:
      "bg-emerald-900/50 text-emerald-300 border border-emerald-700",
    junior: "bg-slate-700/50 text-slate-300 border border-slate-600",
    external: "bg-orange-900/50 text-orange-300 border border-orange-700",
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
      className={`border ${person.flagged ? "border-rose-500" : "border-slate-600"} ${compact ? "px-1 py-0.5" : "p-3"} bg-gradient-to-b ${
        person.flagged
          ? "from-rose-900/50 to-rose-800/50"
          : "from-slate-800 to-slate-700"
      } font-semibold cursor-move hover:from-slate-700 hover:to-slate-600 ${compact ? "min-w-[50px]" : "min-w-[120px]"} transition-all group sticky top-0 z-20 relative ${
        isHighlighted ? "ring-2 ring-cyan-500/50 ring-inset" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <div
        className={`flex flex-col items-center ${compact ? "gap-0" : "gap-2"}`}
      >
        <GripVertical className="text-slate-500" size={compact ? 8 : 14} />
        <div
          className={`font-semibold ${person.flagged ? "text-rose-300" : "text-slate-100"} ${compact ? "text-xs leading-tight" : "text-sm"} text-center cursor-pointer hover:underline flex flex-col items-center gap-0.5`}
          onClick={handleNameClick}
        >
          {person.flagged && (
            <Flag
              size={compact ? 8 : 12}
              className="text-rose-400 fill-rose-400"
            />
          )}
          <span>{person.name}</span>
        </div>
        {!compact && (
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
      {compact && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:flex flex-col gap-1 items-center bg-slate-900 border border-slate-600 rounded-lg px-2 py-1.5 shadow-xl z-50 pointer-events-none whitespace-nowrap">
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
        className={`border ${isReviewerFlagged || isRevieweeFlagged ? "border-rose-500/50" : "border-slate-600"} ${compact ? "p-0.5" : "p-3"} ${
          isReviewerFlagged || isRevieweeFlagged
            ? "bg-rose-900/20"
            : "bg-slate-800/50"
        } text-center transition-colors ${
          isInHoveredRow || isInHoveredColumn ? "bg-slate-700/50" : ""
        }`}
        onMouseEnter={() => onHover(reviewer.id, reviewee.id)}
        onMouseLeave={() => onHover(null, null)}
      >
        <Lock className="text-slate-600 mx-auto" size={iconSize} />
      </td>
    );
  }

  return (
    <td
      className={`border ${isReviewerFlagged || isRevieweeFlagged ? "border-rose-500/50" : "border-slate-600"} ${compact ? "p-0.5" : "p-3"} text-center cursor-pointer transition-all duration-150 ${
        isReviewerFlagged || isRevieweeFlagged
          ? "bg-rose-900/20 hover:bg-rose-800/30"
          : sameProject
            ? "bg-cyan-950/50 hover:bg-cyan-900/50"
            : "bg-slate-800 hover:bg-slate-700"
      } ${
        isHoveredCell
          ? "ring-2 ring-cyan-500/50 ring-inset"
          : isInHoveredRow || isInHoveredColumn
            ? "bg-slate-700/70"
            : ""
      }`}
      onClick={handleClick}
      onMouseEnter={() => onHover(reviewer.id, reviewee.id)}
      onMouseLeave={() => onHover(null, null)}
    >
      <div className="flex items-center justify-center transition-all duration-200 hover:scale-125">
        {isChecked ? (
          isMutual ? (
            <ArrowLeftRight
              className="text-cyan-400"
              size={iconSize}
              strokeWidth={2.5}
            />
          ) : (
            <Check
              className="text-emerald-400"
              size={iconSize}
              strokeWidth={3}
            />
          )
        ) : (
          <Circle className="text-slate-600" size={iconSize} strokeWidth={2} />
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

export default function ReviewGrid() {
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
  } = useStore();
  const [hoveredCell, setHoveredCell] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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
  const filteredRowPeople = searchQuery.trim()
    ? sortedPeople.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : sortedPeople;

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

  function handleCellHover(reviewerId, revieweeId) {
    if (reviewerId && revieweeId) {
      setHoveredCell({ reviewerId, revieweeId });
    } else {
      setHoveredCell(null);
    }
  }

  if (people.length === 0) {
    return (
      <div className="p-12 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl text-center">
        <BarChart3 className="mx-auto mb-4 text-slate-600" size={56} />
        <h3 className="text-xl font-semibold text-slate-300 mb-2">
          No People Yet
        </h3>
        <p className="text-slate-500">
          Add people on the People page to get started with review assignments
        </p>
      </div>
    );
  }

  return (
    <div
      className={`bg-slate-800 overflow-hidden ${
        compactMode ? "" : "border border-slate-700 rounded-xl shadow-2xl"
      }`}
    >
      {!compactMode && (
        <div className="px-6 py-4 flex items-start justify-between border-b border-slate-700">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-slate-100 flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <BarChart3 className="text-cyan-400" size={28} />
              </div>
              Review Matrix
            </h2>
            <p className="text-sm text-slate-400 flex items-center gap-2 flex-wrap">
              <span>Single-click for one-way, double-click for mutual</span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1">
                <Flag size={14} className="text-rose-400 fill-rose-400" />
                Click name to flag concern
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1">
                <Lock size={14} className="text-slate-500" />
                Self-review (automatic)
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-cyan-950/50 border border-cyan-900" />
                Same project
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter rows..."
                className="pl-9 pr-8 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all w-48"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={toggleCompactMode}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-all flex items-center gap-2 border border-slate-600"
              title="Switch to compact view"
            >
              <Minimize2 size={18} />
              Compact
            </button>
          </div>
        </div>
      )}

      {compactMode && (
        <div className="px-2 py-1 flex justify-between items-center gap-2 border-b border-slate-700">
          <button
            onClick={exportToExcel}
            className="px-2 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded transition-all flex items-center gap-1 text-xs shadow-lg shadow-blue-600/30"
            title="Export to Excel"
          >
            <FileSpreadsheet size={14} />
          </button>
          <div className="relative flex-1 max-w-[180px]">
            <Search
              size={12}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter rows..."
              className="pl-6 pr-6 py-0.5 w-full bg-slate-700 border border-slate-600 rounded text-slate-100 placeholder-slate-400 text-xs focus:ring-1 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X size={10} />
              </button>
            )}
          </div>
          <button
            onClick={toggleCompactMode}
            className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-all flex items-center gap-1 border border-slate-600 text-xs"
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
                  className={`border border-slate-600 ${compactMode ? "px-1 py-0.5" : "p-3"} bg-gradient-to-br from-slate-700 to-slate-600 font-bold ${compactMode ? "text-xs leading-tight" : "text-sm"} sticky left-0 top-0 z-30`}
                >
                  <div className="text-slate-300">
                    {compactMode ? "→" : "Reviewee →"}
                  </div>
                  <div className="text-slate-300">
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
                      isHighlighted={
                        hoveredCell && hoveredCell.revieweeId === person.id
                      }
                      onToggleFlag={togglePersonFlag}
                    />
                  ))}
                </SortableContext>

                <th
                  className={`border border-slate-600 ${compactMode ? "px-1 py-0.5" : "p-3"} bg-gradient-to-br from-amber-900 to-amber-950 font-bold sticky right-0 top-0 z-30`}
                >
                  <div className="text-amber-300 flex items-center justify-center gap-1">
                    <BarChart3 size={compactMode ? 12 : 18} />
                    {!compactMode && "Statistics"}
                  </div>
                </th>
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

                      <td
                        className={`border border-slate-600 ${compactMode ? "px-1 py-0.5" : "p-3"} bg-amber-950 sticky right-0 z-10`}
                      >
                        <div
                          className={`${compactMode ? "text-xs space-y-0" : "text-sm space-y-2"}`}
                        >
                          <div
                            className={`flex ${compactMode ? "justify-center" : "justify-between"} items-center ${compactMode ? "gap-0" : "gap-2"}`}
                          >
                            {!compactMode && (
                              <span className="font-medium text-slate-400">
                                Received:
                              </span>
                            )}
                            <span
                              className={`font-bold text-cyan-400 ${compactMode ? "text-xs leading-tight" : "text-base"}`}
                            >
                              {stats.reviewsReceived}
                            </span>
                          </div>
                          <div
                            className={`flex ${compactMode ? "justify-center" : "justify-between"} items-center ${compactMode ? "gap-0" : "gap-2"}`}
                          >
                            {!compactMode && (
                              <span className="font-medium text-slate-400">
                                Doing:
                              </span>
                            )}
                            <span
                              className={`font-bold text-cyan-400 ${compactMode ? "text-xs leading-tight" : "text-base"}`}
                            >
                              {stats.reviewsDoing}
                            </span>
                          </div>
                          <div
                            className={`flex ${compactMode ? "justify-center" : "justify-between"} items-center ${compactMode ? "gap-0.5" : "gap-2"} ${
                              stats.seniorReviews >= 1
                                ? "text-emerald-400"
                                : "text-amber-400"
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
