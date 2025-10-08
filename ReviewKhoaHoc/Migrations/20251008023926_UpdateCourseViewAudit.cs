using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReviewKhoaHoc.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCourseViewAudit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "CourseId",
                table: "course_view_audit",
                type: "text",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastUpdated",
                table: "course_view_audit",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastUpdated",
                table: "course_view_audit");

            migrationBuilder.AlterColumn<Guid>(
                name: "CourseId",
                table: "course_view_audit",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
        }
    }
}
