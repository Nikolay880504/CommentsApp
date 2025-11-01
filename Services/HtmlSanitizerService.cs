
using Ganss.Xss;

namespace CommentsApp.Services
{
    public class HtmlSanitizerService : IHtmlSanitizerService
    {
        private readonly HtmlSanitizer _sanitizer;

        public HtmlSanitizerService()
        {
            _sanitizer = new HtmlSanitizer();

            _sanitizer.AllowedTags.Clear();
            _sanitizer.AllowedTags.Add("a");
            _sanitizer.AllowedTags.Add("code");
            _sanitizer.AllowedTags.Add("i");
            _sanitizer.AllowedTags.Add("strong");
           
            _sanitizer.AllowedAttributes.Clear();
            _sanitizer.AllowedAttributes.Add("href");
            _sanitizer.AllowedAttributes.Add("title");

            _sanitizer.RemovingAttribute += (s, e) =>
            {
                if (e.Tag.TagName.Equals("a", StringComparison.OrdinalIgnoreCase))
                {
                    if (e.Attribute.Name.Equals("href", StringComparison.OrdinalIgnoreCase) ||
                        e.Attribute.Name.Equals("title", StringComparison.OrdinalIgnoreCase))
                    {
                        e.Cancel = true;
                    }
                }
            };

            _sanitizer.AllowedSchemes.Clear();
            _sanitizer.AllowedSchemes.Add("http");
            _sanitizer.AllowedSchemes.Add("https");
        }

        public string Sanitize(string html)
        {
            if (string.IsNullOrEmpty(html))
            {
                return string.Empty;
            }
            return _sanitizer.Sanitize(html);
        }
    }
}