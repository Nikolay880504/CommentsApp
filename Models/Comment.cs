using System.ComponentModel.DataAnnotations;

namespace CommentsApp.Models
{
    public class Comment
    {
        public int Id { get; set; }

        [Required]
        [StringLength(1000)]
        public string Text { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int UserId { get; set; } 
        public User User { get; set; } = null!; 

        public int? ParentCommentId { get; set; }
        public Comment? ParentComment { get; set; } 
        public ICollection<Comment> Replies { get; set; } = new List<Comment>();

        public string? FilePath { get; set; } 
    }
}
