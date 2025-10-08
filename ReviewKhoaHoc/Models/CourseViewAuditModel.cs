namespace ReviewKhoaHoc.Models
{
    public class CourseViewAuditModel
    {
        public required string CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public string CourseType { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string CourseLink { get; set; } = string.Empty;
        public int ViewCount { get; set; } = 1;
        public DateTime ViewedAt { get; set; } = DateTime.UtcNow;
    }
}
