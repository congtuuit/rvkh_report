using Microsoft.EntityFrameworkCore;
using ReviewKhoaHoc.Database;
using ReviewKhoaHoc.Interfaces;
using ReviewKhoaHoc.Middlewares;
using ReviewKhoaHoc.Repositories;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Configure DbContextFactory for PostgreSQL
builder.Services.AddDbContextFactory<AppDbContext>(options =>
{
    // Make sure your connection string "DefaultConnection" is in appsettings.json
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Register Repository Factory
builder.Services.AddScoped<IRepositoryFactory, RepositoryFactory>();

// Configure Controllers and JSON options (CamelCase naming)
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

// Configure Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS policy to allow all origins/headers/methods
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configure SPA Static Files: tells the app where the built React files are located
builder.Services.AddSpaStaticFiles(configuration =>
{
    configuration.RootPath = "wwwroot";
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Use the defined CORS policy
app.UseCors("AllowAll");

// Custom Middleware for API Key
app.UseMiddleware<ApiKeyMiddleware>();

// ----------------------------------------------------
// SPA / Static File Configuration
// ----------------------------------------------------

// Enables serving default files (like index.html) when a directory is requested
app.UseDefaultFiles();

// Enables serving static files (JS, CSS, images, etc.) from wwwroot
app.UseStaticFiles();

// Map API Controllers
app.MapControllers();

// **CRITICAL FOR SPA ROUTING**
// For any unmatched route (like /products/123), fall back to serving index.html.
// The React router will then take over on the client-side.
app.MapFallbackToFile("index.html");

// ----------------------------------------------------

app.Run();