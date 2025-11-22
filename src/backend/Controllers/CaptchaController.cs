using DNTCaptcha.Core;
using Microsoft.AspNetCore.Mvc;

namespace CommentsApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CaptchaController : ControllerBase
    {
        private readonly IDNTCaptchaApiProvider _apiProvider;

        public CaptchaController(IDNTCaptchaApiProvider apiProvider)
        {
            _apiProvider = apiProvider;
        }

        [HttpGet("params")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true, Duration = 0)]
        public ActionResult<DNTCaptchaApiResponse> GetCaptchaParameters()
        {
            var captchaAttributes = new DNTCaptchaTagHelperHtmlAttributes
            {
                BackColor = "#f7f3f3",
                ForeColor = "#111111",
                FontName = "Tahoma",
                FontSize = 15,
                Language = Language.English,
                DisplayMode = DisplayMode.SumOfTwoNumbers,
                Max = 9,
                Min = 1,
                TextBoxClass = "captcha-input",
                RefreshButtonClass = "captcha-refresh"
            };

            return _apiProvider.CreateDNTCaptcha(captchaAttributes);
        }
    }
}
