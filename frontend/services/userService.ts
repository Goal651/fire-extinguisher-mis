import api from "@/lib/axios";

export const userService = {
  getUsers: async (search = "", role = "") => {
    const response = await api.get("/admin/users", {
      params: { search, role },
    });
    return response.data;
  },

  createUser: async (data: any) => {
    const response = await api.post("/admin/users", data);
    return response.data;
  },

  updateUser: async (id: string, data: any) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/admin/stats");
    return response.data;
  },

  checkDataIntegrity: async () => {
    const response = await api.post("/admin/data-integrity/check");
    return response.data;
  },

  cleanData: async () => {
    const response = await api.post("/admin/data-integrity/clean");
    return response.data;
  },
};
