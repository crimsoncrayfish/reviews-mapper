import { useState, useEffect } from "react";
import Navigation from "./components/Navigation";
import NameManager from "./components/NameManager";
import ReviewGrid from "./components/ReviewGrid";
import ToastContainer from "./components/ToastContainer";
import { useStore } from "./store";
import * as XLSX from "xlsx";

function App() {
  const getPageFromURL = () => {
    const pageParam = new URLSearchParams(window.location.search).get("page");
    if (pageParam === "mapping" || pageParam === "matrix") return "matrix";
    if (pageParam === "people") return "people";

    const segment = window.location.pathname.split("/").filter(Boolean).pop();
    if (segment === "mapping" || segment === "matrix") return "matrix";
    return "people";
  };

  const [currentPage, setCurrentPage] = useState(getPageFromURL());
  const { people, addToast, compactMode } = useStore();

  useEffect(() => {
    const base = import.meta.env.BASE_URL.endsWith("/")
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    const pageParam = currentPage === "matrix" ? "matrix" : "people";
    window.history.pushState({}, "", `${base}?page=${pageParam}`);
  }, [currentPage]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getPageFromURL());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleExportCSV = () => {
    if (people.length === 0) {
      addToast("No people to export", "warning");
      return;
    }

    const csvContent = people
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

  const handleExportExcel = () => {
    if (people.length === 0) {
      addToast("No people to export", "warning");
      return;
    }

    const { relationships } = useStore.getState();
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
    addToast(`Exported review matrix to Excel!`, "success");
  };

  const isMatrixPage = currentPage === "matrix";
  const hideUI = compactMode && isMatrixPage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <ToastContainer />

      {!hideUI && (
        <Navigation
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onExportCSV={handleExportCSV}
          onExportExcel={handleExportExcel}
          peopleCount={people.length}
        />
      )}

      <main className={hideUI ? "h-screen" : "p-8 min-h-[calc(100vh-200px)]"}>
        <div
          className={
            hideUI
              ? "h-full"
              : currentPage === "people"
                ? "max-w-7xl mx-auto h-full"
                : "h-full"
          }
        >
          <div
            className={`animate-fadeIn ${currentPage === "people" ? "h-full" : ""}`}
          >
            {currentPage === "people" && <NameManager />}
            {currentPage === "matrix" && <ReviewGrid />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
