using System.Globalization;
using System.Text.Json.Serialization;

namespace ReviewKhoaHoc.Models
{
    public class RevenueReportModel
    {
        public class Order
        {
            [JsonPropertyName("order_id")]
            public long OrderId { get; set; }

            [JsonPropertyName("order_number")]
            public string OrderNumber { get; set; }

            [JsonPropertyName("order_total")]
            public int OrderTotal { get; set; }

            [JsonPropertyName("created_date")]
            public string CreatedDate { get; set; }

            [JsonPropertyName("completed_date")]
            public string CompletedDate { get; set; }

            // ✅ Property convert string → DateTime
            [JsonIgnore]
            public DateTime? OrderCompletedDate
            {
                get
                {
                    if (DateTime.TryParseExact(
                            CompletedDate,
                            "yyyy-MM-dd HH:mm:ss",
                            CultureInfo.InvariantCulture,
                            DateTimeStyles.None,
                            out var dt))
                    {
                        return dt;
                    }

                    return null; // hoặc throw nếu bạn muốn strict
                }
            }

            [JsonPropertyName("description")]
            public string Description { get; set; }
        }

        public class ReportResponse
        {
            [JsonPropertyName("success")]
            public bool Success { get; set; }

            [JsonPropertyName("extra")]
            public string Extra { get; set; }

            [JsonPropertyName("data")]
            public List<Order> Data { get; set; }
        }
    }
}
