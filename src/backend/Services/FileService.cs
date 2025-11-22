
namespace CommentsApp.Services
{
    public class FIleService
    {
        private readonly string _uploadPath;

        public FIleService(IWebHostEnvironment env)
        {
            _uploadPath = Path.Combine(env.ContentRootPath, "wwwroot", "uploads");

            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
        }

        public string SaveFile(IFormFile file)
        {
            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(_uploadPath, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                file.CopyTo(stream);
            }
            return "/uploads/" + fileName;
        }

        public byte[]? GetFileBytes(string fileName)
        {
            var path = Path.Combine(_uploadPath, fileName);

            if (!File.Exists(path))
                return null;

            return File.ReadAllBytes(path);
        }
    }
}
