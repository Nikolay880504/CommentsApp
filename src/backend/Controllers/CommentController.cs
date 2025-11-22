using CommentsApp.Data;
using CommentsApp.Models;
using CommentsApp.Services;
using DNTCaptcha.Core;
using Microsoft.AspNetCore.Mvc;

namespace CommentsApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentController : ControllerBase
    {
        private readonly ICommentRepository _commentRepository;
        private readonly IHtmlSanitizerService _htmlSanitizerService;
        private readonly FIleService _fileService;

        public CommentController(
            ICommentRepository commentRepository,
            IHtmlSanitizerService htmlSanitizerService,
            FIleService fileService)
        {
            _commentRepository = commentRepository;
            _htmlSanitizerService = htmlSanitizerService;
            _fileService = fileService;
        }

        [HttpPost]
        [ValidateDNTCaptcha(ErrorMessage = "Please enter the security code as a number.")]
        public async Task<IActionResult> PostComment([FromForm] CommentCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var sanitizedText = _htmlSanitizerService.Sanitize(dto.TextMessage);

            string? filePath = null;
            if (dto.UploadedFile != null)
            {
                filePath = _fileService.SaveFile(dto.UploadedFile);
            }

            var comment = new Comment
            {
                UserName = dto.UserName,
                Email = dto.Email,
                Text = sanitizedText,
                ParentCommentId = dto.ParentCommentId,
                CreatedAt = DateTime.UtcNow,
                HomePage = dto.HomePage,
                FilePath = filePath
            };

            await _commentRepository.AddCommentAsync(comment);
            return Ok();
        }

        [HttpGet("pageIndex/{pageIndex}")]
        public async Task<IActionResult> GetComments(int pageIndex)
        {
            var pageSize = 25;
            if (pageIndex < 1) pageIndex = 1;

            var comments = await _commentRepository.GetCommentsAsync(pageIndex, pageSize);

            var commentsViewModel = comments.Select(c => new CommentViewModelDto
            {
                Id = c.Id,
                UserName = c.UserName,
                Email = c.Email,
                TextMessage = c.Text,
                ParentCommentId = c.ParentCommentId,
                HomePage = c.HomePage,
                CreatedAt = c.CreatedAt,
                FilePath = c.FilePath
            }).ToList();

            var totalComments = await _commentRepository.GetTotalCommentsCountAsync();

            var response = new CommentListResponse
            {
                Comments = commentsViewModel,
                TotalPages = (int)Math.Ceiling(totalComments / (double)pageSize)
            };

            return Ok(response);
        }

        [HttpGet("replies/{id}")]
        public async Task<ActionResult<RepliesResponse>> GetReplies(
            int id,
            [FromQuery] int skip = 0,
            [FromQuery] int take = 10)
        {
            var totalCount = await _commentRepository.GetReplyCountAsync(id);

            var replies = await _commentRepository.GetRepliesAsync(id, skip, take);

            var allReplies = replies.Select(c => new CommentViewModelDto
            {
                Id = c.Id,
                UserName = c.UserName,
                Email = c.Email,
                TextMessage = c.Text,
                ParentCommentId = c.ParentCommentId,
                HomePage = c.HomePage,
                CreatedAt = c.CreatedAt,
                FilePath = c.FilePath
            }).ToList();

            return Ok(new RepliesResponse
            {
                Replies = allReplies,
                TotalCount = totalCount
            });
        }

        [HttpGet("download/{fileName}")]
        public IActionResult Download(string fileName)
        {
            var fileBytes = _fileService.GetFileBytes(fileName);
            if (fileBytes == null)
                return NotFound();

            return File(fileBytes, "application/octet-stream", fileName);
        }
    }
}
