import http from "./httpClient";

export async function getDashboardStats({from, to}) {
  const response = await http.get(`/CourseAudit/stats`, {
    params: { from, to }
  });
  return response.data;
}

export async function getRevenueReportAsync({from, to}) {
  const response = await http.get(`/report/revenue`, {
    params: { from, to }
  });
  return response.data;
}
