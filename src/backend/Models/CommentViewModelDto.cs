namespace CommentsApp.Models
{
    public class CommentViewModelDto
    {   public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string TextMessage { get; set; } = string.Empty;
        public int? ParentCommentId { get; set; }
        public string? HomePage { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? FilePath { get; set; }

    }
}
