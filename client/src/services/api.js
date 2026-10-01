const apiBaseUrl = import.meta.env.PROD
  ? import.meta.env.VITE_API_BASE_URL || ""
  : "";

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The server returned an unreadable response.");
  }

  if (!response.ok || !result.success) {
    throw new Error(result.message || "The request could not be completed.");
  }

  return result.data;
}

export function fetchHealth() {
  return request("/api/health");
}

export function fetchClasses() {
  return request("/api/classes");
}

export function createClass(classData) {
  return request("/api/classes", {
    method: "POST",
    body: JSON.stringify(classData),
  });
}

export function updateClass(classId, classData) {
  return request(`/api/classes/${classId}`, {
    method: "PUT",
    body: JSON.stringify(classData),
  });
}

export function deleteClass(classId) {
  return request(`/api/classes/${classId}`, { method: "DELETE" });
}