using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReviewKhoaHoc.Database;
using ReviewKhoaHoc.Entities;
using ReviewKhoaHoc.Models;

namespace ReviewKhoaHoc.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CourseAuditController : ControllerBase
    {
        private readonly AppDbContext _db;

        public CourseAuditController(AppDbContext db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<IActionResult> AddView([FromBody] CourseViewAuditModel model)
        {
            var today = model.ViewedAt.Date;
            var exists = await _db.CourseViewAudits.AnyAsync(x => x.CourseId == model.CourseId && x.Date == today);
            if (exists)
            {
                await _db.Database.ExecuteSqlRawAsync(
                    "UPDATE \"course_view_audit\" " +
                    "SET \"ViewCount\" = \"ViewCount\" + 1, \"LastUpdated\" = NOW(), \"ViewedAt\" = NOW() " +
                    "WHERE \"CourseId\" = {0} AND \"Date\" = {1}",
                    model.CourseId, today);

                return Ok();
            }

            var entity = new CourseViewAudit
            {
                CourseId = model.CourseId,
                CourseName = model.CourseName,
                CourseType = model.CourseType,
                Price = model.Price,
                CourseLink = model.CourseLink,
                ViewCount = model.ViewCount,
                Date = today
            };
            _db.CourseViewAudits.Add(entity);
            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats(DateTime? from = null, DateTime? to = null)
        {
            var fromDate = from ?? DateTime.UtcNow.AddDays(-7);
            var toDate = to ?? DateTime.UtcNow;

            var fromUtc = DateTime.SpecifyKind(fromDate, DateTimeKind.Utc);
            var toUtc = DateTime.SpecifyKind(toDate, DateTimeKind.Utc);

            var query = _db.CourseViewAudits.AsQueryable();

            if (from.HasValue) query = query.Where(x => x.ViewedAt >= fromUtc);
            if (to.HasValue) query = query.Where(x => x.ViewedAt <= toUtc);

            // 1. Stats theo khoá học
            var courseStats = await query
                .GroupBy(x => new { x.CourseId, x.CourseName, x.CourseType, x.Price, x.CourseLink })
                .Select(g => new {
                    g.Key.CourseName,
                    g.Key.CourseType,
                    g.Key.Price,
                    g.Key.CourseLink,
                    TotalViews = g.Sum(x => x.ViewCount)
                })
                .OrderByDescending(x => x.TotalViews)
                .ToListAsync();

            // 2. Stats theo ngày
            var dailyStats = await query
                .GroupBy(x => x.ViewedAt.Date)
                .Select(g => new {
                    Date = g.Key,
                    TotalViews = g.Sum(x => x.ViewCount)
                })
                .OrderBy(x => x.Date)
                .ToListAsync();


            // 3. Stats theo loại khoá học (free vs paid)
            var courseTypeStats = await query
                .GroupBy(x => x.CourseType) // giả sử "free", "paid", hoặc giá trị khác
                .Select(g => new {
                    CourseType = g.Key,
                    TotalViews = g.Sum(x => x.ViewCount)
                })
                .ToListAsync();

            return Ok(new
            {
                CourseStats = courseStats,
                DailyStats = dailyStats,
                CourseTypeStats = courseTypeStats
            });
        }

        // GET: api/courses?search=react&sortBy=views&order=desc&page=1&pageSize=10
        [HttpGet]
        public async Task<IActionResult> GetCourses(
            string? search = null,
            string? sortBy = "views",
            string? order = "desc",
            int page = 1,
            int pageSize = 10)
        {
            var query = _db.CourseViewAudits.AsQueryable();

            // 🔍 Tìm kiếm theo tên khóa học
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(c => c.CourseName.Contains(search));
            }

            // 🔢 Sắp xếp theo cột
            query = (sortBy?.ToLower(), order?.ToLower()) switch
            {
                ("price", "asc") => query.OrderBy(c => c.Price),
                ("price", "desc") => query.OrderByDescending(c => c.Price),
                ("views", "asc") => query.OrderBy(c => c.ViewCount),
                ("views", "desc") => query.OrderByDescending(c => c.ViewCount),
                ("created", "asc") => query.OrderBy(c => c.ViewedAt),
                ("created", "desc") => query.OrderByDescending(c => c.ViewedAt),
                _ => query.OrderByDescending(c => c.ViewCount)
            };

            // 📊 Phân trang
            var totalCount = await query.CountAsync();
            var courses = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                Total = totalCount,
                Page = page,
                PageSize = pageSize,
                Data = courses
            });
        }
    }
}
