using DNTCaptcha.Core;
using CommentsApp.Data;
using CommentsApp.Models;
using Microsoft.AspNetCore.Mvc;
using CommentsApp.Services;

namespace CommentsApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentController : ControllerBase
    {
        private readonly ICommentRepository _commentRepository;
        private readonly IHtmlSanitizerService _htmlSanitizerService;
        public CommentController(ICommentRepository commentRepository, IHtmlSanitizerService htmlSanitizerService)
        {
            _commentRepository = commentRepository;
            _htmlSanitizerService = htmlSanitizerService;
        }
        [HttpPost]
   //     [ValidateAntiForgeryToken]
        [ValidateDNTCaptcha(
            ErrorMessage = "Invalid security code.")]
        //    ,Language = Language.English,
        //    DisplayMode = DisplayMode.ShowDigits)]
        public async Task<IActionResult> PostComment([FromForm] CommentCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var sanitizedText = _htmlSanitizerService.Sanitize(dto.Text);

            var comment = new Comment
            {
                UserName = dto.UserName,
                Email = dto.Email,
                Text = sanitizedText,
                ParentCommentId = dto.ParentCommentId,
                CreatedAt = DateTime.UtcNow
            };

            await _commentRepository.AddCommentAsync(comment);

           return Ok(comment);
        }

        [HttpGet]
        public async Task<IActionResult> GetComments([FromForm] PaginationParametersDto dto)
        {
            var comments = await _commentRepository.GetCommentsAsync(dto.PageIndex, dto.PageSize);
            return Ok(comments);
        }
    }
}
