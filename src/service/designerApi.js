import { apiCall } from "./apiUtils";

export const Pending_account = async () => {
  try {
    return await apiCall("/designer/pending-count", {
      method: "GET",
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};

export const allDesigners = async () => {
  try {
    return await apiCall("/designer/designersDashboard", {
      method: "GET",
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};

export const disableDesigner = async (designerId) => {
  try {
    return await apiCall(`/designer/disable/${designerId}`, {
      method: "PATCH",
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};

export const Total_count = async () => {
  try {
    return await apiCall("/designer/total-count", {
      method: "GET",
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};
export const Approved_count = async () => {
  try {
    return await apiCall("/designer/approved-count", {
      method: "GET",
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};
export const updateDesignerApprovalStatus = async (designerId, isApproved) => {
  try {
    return await apiCall(`/designer/${designerId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ is_approved: isApproved }), // Pass true for approved or false for pending
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};

export const GetDetailForDesigner = async (designerId) => {
  try {
    return await apiCall(`/designer/designers/${designerId}`, {
      method: "GET",
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};

// Get all designers for filter dropdown
export const getAllDesignersForFilter = async () => {
  try {
    // Use the existing working API function
    const response = await allDesigners();
    return response;
  } catch (error) {
    console.error("Designer filter API error:", error);
    throw new Error(error.message || 'Failed to fetch designers');
  }
};

// Upload product sample images for a designer
export const uploadProductSampleImages = async (designerId, imageUrls) => {
  try {
    return await apiCall(`/designer/${designerId}/product-sample-images`, {
      method: "POST",
      body: JSON.stringify({ imageUrls }),
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw error;
  }
};

// Delete product sample images by index
export const deleteProductSampleImages = async (designerId, imageIndexes) => {
  try {
    return await apiCall(`/designer/${designerId}/product-sample-images`, {
      method: "DELETE",
      body: JSON.stringify({ imageIndexes }),
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw error;
  }
};
