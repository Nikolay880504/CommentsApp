using CommentsApp.Models;

namespace CommentsApp.Data
{
    public interface ICommentRepository
    {
        Task AddCommentAsync(Comment comment);

        Task<List<Comment>> GetCommentsAsync(int pageIndex, int pageSize);

        Task<int> GetTotalCommentsCountAsync();

        Task<int> GetReplyCountAsync(int parentCommentId);

        Task<List<Comment>> GetRepliesAsync(int parentCommentId, int skip, int take);
    }
}
