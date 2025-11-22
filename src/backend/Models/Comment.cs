
using System.ComponentModel.DataAnnotations;

namespace CommentsApp.Models
{
    public class Comment
    {
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public string UserName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(1000)]
        public string Text { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int? ParentCommentId { get; set; }

        [Url]
        public string? HomePage { get; set; }

        public string? FilePath { get; set; }
    }
}
