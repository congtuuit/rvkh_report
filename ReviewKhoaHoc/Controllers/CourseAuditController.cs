using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReviewKhoaHoc.Database;
using ReviewKhoaHoc.Entities;
using ReviewKhoaHoc.Interfaces;
using ReviewKhoaHoc.Models;
using ReviewKhoaHoc.Repositories;

namespace ReviewKhoaHoc.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CourseAuditController : ControllerBase
    {
        private readonly IRepositoryFactory _repositoryFactory;
        private readonly IDbContextFactory<AppDbContext> _dbContextFactory;

        public CourseAuditController(IRepositoryFactory repositoryFactory, IDbContextFactory<AppDbContext> dbContextFactory)
        {
            _repositoryFactory = repositoryFactory;
            _dbContextFactory = dbContextFactory;
        }


        [HttpPost]
        public async Task<IActionResult> AddView([FromBody] CourseViewAuditModel model)
        {
            var today = model.ViewedAt.Date;

            var context = _repositoryFactory.CreateRepository<CourseViewAudit>();

            var exists = await context.AnyAsync(x => x.CourseId == model.CourseId && x.Date == today);

            if (exists)
            {
                await context.ExecuteSqlRawAsync(
                    "UPDATE \"course_view_audit\" " +
                    "SET \"ViewCount\" = \"ViewCount\" + 1, \"LastUpdated\" = NOW(), \"ViewedAt\" = NOW() " +
                    "WHERE \"CourseId\" = {0} AND \"Date\" = {1}",
                    model.CourseId, today
                );

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
                Date = today,
                ViewedAt = DateTime.UtcNow,
                LastUpdated = DateTime.UtcNow
            };

            await context.AddAsync(entity);
            await context.SaveChangesAsync();

            return Ok();
        }


        [HttpGet("stats")]
        public async Task<IActionResult> GetStats(DateTime? from = null, DateTime? to = null)
        {
            if (!from.HasValue || !to.HasValue)
                return BadRequest("Missing 'from' or 'to' date.");

            var fromUtc = from.Value.ToUniversalTime();
            var toUtc = to.Value.ToUniversalTime();

            // Tạo 3 context riêng biệt để chạy song song
            await using var context1 = await _dbContextFactory.CreateDbContextAsync();
            await using var context2 = await _dbContextFactory.CreateDbContextAsync();
            await using var context3 = await _dbContextFactory.CreateDbContextAsync();

            // Tạo repository cho từng context
            var repo1 = new GenericRepository<CourseViewAudit>(context1);
            var repo2 = new GenericRepository<CourseViewAudit>(context2);
            var repo3 = new GenericRepository<CourseViewAudit>(context3);

            // 1. Thống kê theo khoá học
            var courseStatsTask = repo1.Query()
                .Where(x => x.ViewedAt >= fromUtc && x.ViewedAt <= toUtc)
                .GroupBy(x => new { x.CourseId, x.CourseName, x.CourseType, x.Price, x.CourseLink })
                .Select(g => new
                {
                    g.Key.CourseName,
                    g.Key.CourseType,
                    g.Key.Price,
                    g.Key.CourseLink,
                    TotalViews = g.Sum(x => x.ViewCount)
                })
                .OrderByDescending(x => x.TotalViews)
                .ToListAsync();

            // 2. Thống kê theo ngày
            var dailyStatsTask = repo2.Query()
                .Where(x => x.ViewedAt >= fromUtc && x.ViewedAt <= toUtc)
                .GroupBy(x => new { x.ViewedAt.Year, x.ViewedAt.Month, x.ViewedAt.Day })
                .Select(g => new
                {
                    Date = new DateTime(g.Key.Year, g.Key.Month, g.Key.Day),
                    TotalViews = g.Sum(x => x.ViewCount)
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            // 3. Thống kê theo loại khoá học
            var courseTypeStatsTask = repo3.Query()
                .Where(x => x.ViewedAt >= fromUtc && x.ViewedAt <= toUtc)
                .GroupBy(x => x.CourseType)
                .Select(g => new
                {
                    CourseType = g.Key,
                    TotalViews = g.Sum(x => x.ViewCount)
                })
                .ToListAsync();

            await Task.WhenAll(courseStatsTask, dailyStatsTask, courseTypeStatsTask);

            return Ok(new
            {
                CourseStats = courseStatsTask.Result,
                DailyStats = dailyStatsTask.Result,
                CourseTypeStats = courseTypeStatsTask.Result
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
            await using var _db = await _dbContextFactory.CreateDbContextAsync();

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
