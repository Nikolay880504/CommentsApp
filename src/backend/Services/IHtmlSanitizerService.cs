namespace CommentsApp.Services
{
    public interface IHtmlSanitizerService
    {
        string Sanitize(string html);
    }
}
