using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReviewKhoaHoc.Migrations
{
    /// <inheritdoc />
    public partial class InitCourseViewAudit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "course_view_audit",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CourseId = table.Column<Guid>(type: "uuid", nullable: false),
                    CourseName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CourseType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    CourseLink = table.Column<string>(type: "text", nullable: false),
                    ViewCount = table.Column<int>(type: "integer", nullable: false),
                    ViewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_course_view_audit", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_course_view_audit_ViewedAt",
                table: "course_view_audit",
                column: "ViewedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "course_view_audit");
        }
    }
}
