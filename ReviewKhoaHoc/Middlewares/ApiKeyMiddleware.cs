namespace ReviewKhoaHoc.Middlewares
{
    public class ApiKeyMiddleware
    {
        private readonly RequestDelegate _next;
        private const string APIKEY_HEADER = "X-API-KEY";

        public ApiKeyMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IConfiguration config)
        {
            // Lấy API key từ cấu hình (appsettings.json hoặc env)
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

            // Cho phép request đi tiếp
            await _next(context);
        }
    }
}
