
namespace CommentsApp.Models
{
    public class RepliesResponse
    {
        public List<CommentViewModelDto> Replies { get; set; } = new();
        public int TotalCount { get; set; }
    }

}
