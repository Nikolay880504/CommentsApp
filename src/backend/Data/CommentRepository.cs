using CommentsApp.Models;
using Microsoft.EntityFrameworkCore;

namespace CommentsApp.Data
{
    public class CommentRepository : ICommentRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public CommentRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public async Task AddCommentAsync(Comment comment)
        {
          
            _dbContext.Comments.Add(comment);

            await _dbContext.SaveChangesAsync();

        }

        public async Task<List<Comment>> GetCommentsAsync(int pageIndex, int pageSize)
        {            
            return await _dbContext.Comments
            .AsNoTracking()
            .OrderByDescending(c => c.CreatedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)            
            .ToListAsync();
        }
    }
}
