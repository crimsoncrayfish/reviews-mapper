import { useState, useEffect, useRef, useMemo } from "react";
import Navigation from "./components/Navigation";
import NameManager from "./components/NameManager";
import ReviewGrid from "./components/ReviewGrid";
import ToastContainer from "./components/ToastContainer";
import { useStore } from "./store";

function isCompactParamEnabled(compactParam) {
  if (!compactParam) return false;
  const normalized = compactParam.toLowerCase();
  return normalized === "1" || normalized === "true";
}

function getURLStateFromWindow() {
  const params = new URLSearchParams(window.location.search);
  const pageParam = params.get("page");
  const compact = isCompactParamEnabled(params.get("compact"));
  if (pageParam === "mapping" || pageParam === "matrix") {
    return {
      page: "matrix",
      search: params.get("search") || "",
      compact,
    };
  }
  if (pageParam === "people") {
    return {
      page: "people",
      search: params.get("search") || "",
      compact,
    };
  }

  const segment = window.location.pathname.split("/").filter(Boolean).pop();
  if (segment === "mapping" || segment === "matrix") {
    return {
      page: "matrix",
      search: params.get("search") || "",
      compact,
    };
  }

  return {
    page: "people",
    search: params.get("search") || "",
    compact,
  };
}

function App() {
  const initialURLState = useMemo(() => getURLStateFromWindow(), []);
  const [currentPage, setCurrentPage] = useState(
    () => initialURLState.page,
  );
  const [matrixSearchQuery, setMatrixSearchQuery] = useState(
    () => initialURLState.search,
  );
  const previousPageRef = useRef(currentPage);
  const isInitialURLSyncRef = useRef(true);
  const { people, compactMode, setCompactMode, theme } = useStore();

  useEffect(() => {
    setCompactMode(initialURLState.compact);
  }, [initialURLState.compact, setCompactMode]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    const base = import.meta.env.BASE_URL.endsWith("/")
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    const params = new URLSearchParams();
    const pageParam = currentPage === "matrix" ? "matrix" : "people";
    params.set("page", pageParam);

    const trimmedSearch = matrixSearchQuery.trim();
    if (currentPage === "matrix" && trimmedSearch) {
      params.set("search", trimmedSearch);
    }

    const effectiveCompactMode = isInitialURLSyncRef.current
      ? initialURLState.compact
      : compactMode;

    if (currentPage === "matrix" && effectiveCompactMode) {
      params.set("compact", "1");
    }

    const nextURL = `${base}?${params.toString()}`;
    const currentURL = `${window.location.pathname}${window.location.search}`;

    if (currentURL !== nextURL) {
      if (isInitialURLSyncRef.current) {
        window.history.replaceState({}, "", nextURL);
      } else if (previousPageRef.current !== currentPage) {
        window.history.pushState({}, "", nextURL);
      } else {
        window.history.replaceState({}, "", nextURL);
      }
    }

    previousPageRef.current = currentPage;
    isInitialURLSyncRef.current = false;
  }, [currentPage, matrixSearchQuery, compactMode, initialURLState.compact]);

  useEffect(() => {
    const handlePopState = () => {
      const urlState = getURLStateFromWindow();
      setCurrentPage(urlState.page);
      setMatrixSearchQuery(urlState.search);
      setCompactMode(urlState.compact);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [setCompactMode]);

  const isMatrixPage = currentPage === "matrix";
  const hideUI = compactMode && isMatrixPage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
      <ToastContainer />

      {!hideUI && (
        <Navigation
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          peopleCount={people.length}
        />
      )}

      <main
        className={hideUI ? "h-screen" : "p-4 sm:p-8 min-h-[calc(100vh-200px)]"}
      >
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
            {currentPage === "matrix" && (
              <ReviewGrid
                searchQuery={matrixSearchQuery}
                setSearchQuery={setMatrixSearchQuery}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
