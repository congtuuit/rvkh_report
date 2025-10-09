namespace ReviewKhoaHoc.Middlewares
{
    public class ApiKeyMiddleware
    {
        private readonly RequestDelegate _next;
        private const string APIKEY_HEADER = "X-API-KEY";
        private const string API_PATH_PREFIX = "/api/"; // Thêm prefix cần kiểm tra

        public ApiKeyMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IConfiguration config)
        {
            // Lấy đường dẫn của request và chuyển thành chữ thường để so sánh
            var path = context.Request.Path.Value;

            // KIỂM TRA ĐIỀU KIỆN BỎ QUA API KEY CHECK
            // Nếu đường dẫn KHÔNG bắt đầu bằng "/api/" (ví dụ: "/", "/index.html", "/assets/...")
            // THÌ cho phép request đi tiếp ngay lập tức mà không cần kiểm tra API Key.
            if (!path.StartsWith(API_PATH_PREFIX, StringComparison.OrdinalIgnoreCase))
            {
                await _next(context);
                return;
            }

            // ------------------------------------------------------------------
            // CHỈ THỰC HIỆN KIỂM TRA API KEY VỚI CÁC ROUTE BẮT ĐẦU BẰNG /api/
            // ------------------------------------------------------------------

            // Lấy API key từ cấu hình
            var configuredKey = config["AppSettings:ApiKey"];

            if (string.IsNullOrWhiteSpace(configuredKey))
            {
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                await context.Response.WriteAsync("API Key not configured.");
                return;
            }

            // Kiểm tra có header X-API-KEY không
            if (!context.Request.Headers.TryGetValue(APIKEY_HEADER, out var extractedKey))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsync("API Key is missing.");
                return;
            }

            // So sánh key
            if (!configuredKey.Equals(extractedKey))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsync("Invalid API Key.");
                return;
            }

            // Cho phép request đi tiếp nếu key hợp lệ
            await _next(context);
        }
    }
}