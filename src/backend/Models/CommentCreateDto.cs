using System.ComponentModel.DataAnnotations;

namespace CommentsApp.Models
{
    public class CommentCreateDto
    {

        [Required(ErrorMessage = "Username is required.")]
        [StringLength(100, ErrorMessage = "Username cannot exceed 100 characters.")]
        public string UserName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string Email { get; set; } = string.Empty; 

        [Required(ErrorMessage = "Message text is required.")]
        [StringLength(1000, ErrorMessage = "Message cannot exceed 1000 characters.")]
        public string TextMessage { get; set; } = string.Empty;

        public int? ParentCommentId { get; set; }

        [Url]
        public string? HomePage { get; set; }

        public IFormFile? UploadedFile { get; set; }

         [Required]
        public string DNTCaptchaText { get; set; } = string.Empty;

        public string DNTCaptchaToken { get; set; } = string.Empty;

        public string DNTCaptchaInputText { get; set; } = string.Empty;
        
    }
}
