import api from "@/lib/axios";

export const dashboardService = {
  getStats: () => api.get("/extinguishers/dashboard-stats"),
};
