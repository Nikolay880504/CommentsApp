using CommentsApp.Models;
using Microsoft.EntityFrameworkCore;

namespace CommentsApp.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Comment> Comments { get; set; }

    }
}
