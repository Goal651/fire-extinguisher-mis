import api from "@/lib/axios";

export const extinguisherService = {
  getAll: async (page = 1, limit = 10, search = "", status = "") => {
    const response = await api.get("/extinguishers", {
      params: {
        page,
        limit,
        search,
        status,
      },
    });

    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/extinguishers/${id}`);

    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post("/extinguishers", data);

    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/extinguishers/${id}`, data);

    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/extinguishers/${id}`);

    return response.data;
  },

  markReported: async (id: string) => {
    const response = await api.put(`/extinguishers/${id}/mark-reported`);

    return response.data;
  },

  inspect: async (id: string, result: "pass" | "fail", notes?: string) => {
    const response = await api.post(`/extinguishers/${id}/inspect`, {
      result,
      notes,
    });
    return response.data;
  },

  scheduleMaintenance: async (id: string, scheduledMaintenanceDate: string, maintenanceNotes?: string) => {
    const response = await api.post(`/extinguishers/${id}/maintenance`, {
      scheduledMaintenanceDate,
      maintenanceNotes,
    });
    return response.data;
  },

  scheduleInspection: async (id: string, scheduledInspectionDate: string) => {
    const response = await api.post(`/extinguishers/${id}/schedule-inspection`, {
      scheduledInspectionDate,
    });
    return response.data;
  },
};

export const getExtinguishers = async (
  page = 1,
  limit = 10,
  search = "",
  status = "",
) => {
  const response = await api.get("/extinguishers", {
    params: {
      page,
      limit,
      search,
      status,
    },
  });

  return response.data;
};

export const getExtinguisher = async (id: string) => {
  const response = await api.get(`/extinguishers/${id}`);

  return response.data;
};

export const createExtinguisher = async (data: any) => {
  const response = await api.post("/extinguishers", data);

  return response.data;
};

export const updateExtinguisher = async (id: string, data: any) => {
  const response = await api.put(`/extinguishers/${id}`, data);

  return response.data;
};

export const deleteExtinguisher = async (id: string) => {
  const response = await api.delete(`/extinguishers/${id}`);

  return response.data;
};

export const markReported = async (id: string) => {
  const response = await api.put(`/extinguishers/${id}/mark-reported`);

  return response.data;
};

export const inspectExtinguisher = async (id: string, result: "pass" | "fail", notes?: string) => {
  const response = await api.post(`/extinguishers/${id}/inspect`, { result, notes });
  return response.data;
};

export const scheduleMaintenance = async (id: string, scheduledMaintenanceDate: string, maintenanceNotes?: string) => {
  const response = await api.post(`/extinguishers/${id}/maintenance`, {
    scheduledMaintenanceDate,
    maintenanceNotes,
  });
  return response.data;
};

export const scheduleInspection = async (id: string, scheduledInspectionDate: string) => {
  const response = await api.post(`/extinguishers/${id}/schedule-inspection`, {
    scheduledInspectionDate,
  });
  return response.data;
};
