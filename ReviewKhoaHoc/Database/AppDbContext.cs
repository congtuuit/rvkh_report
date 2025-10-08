using Microsoft.EntityFrameworkCore;
using ReviewKhoaHoc.Entities;

namespace ReviewKhoaHoc.Database
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<CourseViewAudit> CourseViewAudits => Set<CourseViewAudit>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<CourseViewAudit>(entity =>
            {
                entity.ToTable("course_view_audit");
                entity.HasKey(x => x.Id);
                entity.Property(x => x.CourseName).HasMaxLength(255);
                entity.Property(x => x.CourseType).HasMaxLength(100);
                entity.HasIndex(x => x.ViewedAt);
            });
        }
    }

}
