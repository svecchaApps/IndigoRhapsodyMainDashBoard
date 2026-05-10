import { apiCall } from "./apiUtils";

// Get all trend groups (admin view – includes inactive)
export const getAllTrendGroups = async () => {
  try {
    const result = await apiCall("/trend-watch/admin/all", { method: "GET" });
    return result;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch trend groups");
  }
};

// Get single trend group by ID
export const getTrendGroupById = async (id) => {
  try {
    return await apiCall(`/trend-watch/${id}`, { method: "GET" });
  } catch (error) {
    throw new Error(error.message || "Failed to fetch trend group");
  }
};

// Create a new trend group
export const createTrendGroup = async (data) => {
  try {
    return await apiCall("/trend-watch", {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch (error) {
    throw new Error(error.message || "Failed to create trend group");
  }
};

// Update an existing trend group
export const updateTrendGroup = async (id, data) => {
  try {
    return await apiCall(`/trend-watch/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  } catch (error) {
    throw new Error(error.message || "Failed to update trend group");
  }
};

// Toggle active/inactive
export const toggleTrendGroup = async (id) => {
  try {
    return await apiCall(`/trend-watch/${id}/toggle`, { method: "PATCH" });
  } catch (error) {
    throw new Error(error.message || "Failed to toggle trend group");
  }
};

// Delete a trend group
export const deleteTrendGroup = async (id) => {
  try {
    return await apiCall(`/trend-watch/${id}`, { method: "DELETE" });
  } catch (error) {
    throw new Error(error.message || "Failed to delete trend group");
  }
};

// Reorder trend groups
export const reorderTrendGroups = async (orders) => {
  try {
    return await apiCall("/trend-watch/reorder", {
      method: "POST",
      body: JSON.stringify({ orders }),
    });
  } catch (error) {
    throw new Error(error.message || "Failed to reorder trend groups");
  }
};
