const GAS_URL = import.meta.env.VITE_GAS_URL || "";

const CACHE_KEY = "emp_cache";
const CACHE_TIME_KEY = "emp_cache_time";
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours

// Background fetch to update cache silently
const fetchAndUpdateEmployeesCache = async () => {
  try {
    const response = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({ action: 'apiGetEmployees', data: null }),
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      redirect: "follow",
    });
    const result = await response.json();
    if (result && !result.error) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(result));
      localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
    }
  } catch (e) {
    console.error("Silent cache update failed", e);
  }
};

export const apiCall = async (action, data = null) => {
  if (!GAS_URL) {
    throw new Error("API URL is not defined. Please set VITE_GAS_URL in .env file.");
  }

  // 1. Check cache for apiGetEmployees
  if (action === 'apiGetEmployees') {
    const cached = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
    
    if (cached && cachedTime && (Date.now() - parseInt(cachedTime) < CACHE_DURATION)) {
      // Trigger background update and return cached data immediately
      fetchAndUpdateEmployeesCache();
      return JSON.parse(cached);
    }
  }

  // 2. Clear cache if admin imports new employees
  if (action === 'apiImportEmployees') {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIME_KEY);
  }

  // 3. Normal Fetch
  try {
    const response = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({ action, data }),
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      redirect: "follow",
    });

    const result = await response.json();
    
    // Save to cache if it's apiGetEmployees
    if (action === 'apiGetEmployees' && result && !result.error) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(result));
      localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
    }

    return result;
  } catch (error) {
    console.error("API Call Error:", error);
    throw error;
  }
};
