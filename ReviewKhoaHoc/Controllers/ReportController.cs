using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using static ReviewKhoaHoc.Models.RevenueReportModel;

namespace ReviewKhoaHoc.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportController : ControllerBase
    {
        public ReportController()
        {
        }

        [HttpGet("revenue")]
        public async Task<IActionResult> GetRevenueReport([FromQuery] DateTime from, [FromQuery] DateTime to)
        {
            var result = await FetchRevenueReportAsync(from, to);

            var orderSorted = result.Data
                .Where(x => x.OrderCompletedDate.HasValue)
                .OrderByDescending(x => x.OrderCompletedDate.Value)
                .ToList();

            var responseData = new
            {
                result.Success,
                result.Extra,
                TotalOrders = result.Data.Count,
                TotalRevenue = result.Data.Sum(x => x.OrderTotal),
                Orders = orderSorted,
                ChartData = result.Data
                    .Where(x => x.OrderCompletedDate.HasValue)
                    .GroupBy(x => x.OrderCompletedDate.Value.Date)
                    .OrderBy(g => g.Key)
                    .Select(g => new
                    {
                        Date = g.Key.ToString("yyyy-MM-dd"),
                        TotalOrders = g.Count(),
                        TotalRevenue = g.Sum(x => x.OrderTotal)
                    })
                    .ToList()
            };

            return Ok(responseData);
        }

        private const string REPORT_ENDPOINT = "https://reviewkhoahoc.net/wp-admin/admin-ajax.php?action=revenue_report_v2";

        private async Task<ReportResponse> FetchRevenueReportAsync(DateTime from, DateTime to)
        {
            using var http = new HttpClient();
            var fromStr = from.ToString("yyyy-MM-dd");
            var toStr = to.ToString("yyyy-MM-dd");
            var url = $"{REPORT_ENDPOINT}&from={fromStr}&to={toStr}";

            try
            {
                var response = await http.GetStringAsync(url);
                var data = JsonSerializer.Deserialize<ReportResponse>(response, options: new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (data == null)
                {
                    return new ReportResponse
                    {
                        Success = false,
                        Data = new List<Order>(),
                        Extra = "Failed to parse response"
                    };
                }

                return data;
            }
            catch (Exception ex)
            {
                // Log nếu cần
                return new ReportResponse
                {
                    Success = false,
                    Data = new List<Order>(),
                    Extra = ex.Message
                };
            }
        }
    }
}
