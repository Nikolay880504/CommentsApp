using CommentsApp.Data;
using CommentsApp.Models;
using CommentsApp.Services;
using DNTCaptcha.Core;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace CommentsApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentController : ControllerBase
    {
        private readonly ICommentRepository _commentRepository;
        private readonly IHtmlSanitizerService _htmlSanitizerService;
      
        public CommentController(ICommentRepository commentRepository, IHtmlSanitizerService htmlSanitizerService 
           )
        {
            _commentRepository = commentRepository;
            _htmlSanitizerService = htmlSanitizerService;
          
        }
        [HttpPost]
        [ValidateDNTCaptcha(ErrorMessage = "Please enter the security code as a number.")]
        public async Task<IActionResult> PostComment([FromForm] CommentCreateDto dto)
        {
            Console.WriteLine(dto.DNTCaptchaInputText + " " + dto.DNTCaptchaText + " " + dto.DNTCaptchaToken);
            
            if (!ModelState.IsValid)
            {
                
                return BadRequest(ModelState);
            }
            var sanitizedText = _htmlSanitizerService.Sanitize(dto.TextMessage);
          
            var comment = new Comment
            {
                UserName = dto.UserName,
                Email = dto.Email,
                Text = sanitizedText,
                ParentCommentId = dto.ParentCommentId,
                CreatedAt = DateTime.UtcNow,
                HomePage = dto.HomePage
            };

            await _commentRepository.AddCommentAsync(comment);

           return Ok(comment);
        }

        [HttpGet]
        public async Task<IActionResult> GetComments(int pageIndex)
        {
            var pageSize = 25;
            if (pageIndex < 1) pageIndex = 1;
            
            var comments = await _commentRepository.GetCommentsAsync(pageIndex, pageSize);

            return Ok(comments);
        }
    }
}
