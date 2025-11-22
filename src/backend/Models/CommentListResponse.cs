namespace CommentsApp.Models
{
    public class CommentListResponse
    {
        public List<CommentViewModelDto> Comments { get; set; } = new();
        public int TotalPages { get; set; } 
    }
}
