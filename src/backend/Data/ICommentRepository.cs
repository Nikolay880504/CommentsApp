using CommentsApp.Models;

namespace CommentsApp.Data
{
    public interface ICommentRepository
    {
        Task AddCommentAsync(Comment comment);
        Task<List<Comment>> GetCommentsAsync(int pageIndex, int PageSize);
    }
}
