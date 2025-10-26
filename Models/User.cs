using System.ComponentModel.DataAnnotations;

namespace CommentsApp.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public string UserName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Url]
        public string? HomePage { get; set; }

        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    }
}
