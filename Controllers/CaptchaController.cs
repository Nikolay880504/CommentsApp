
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
                FontSize = 18,

                Language = Language.English,
                DisplayMode = DisplayMode.ShowDigits, 
                Max = 9999, 
                Min = 1000 
            };

            return _apiProvider.CreateDNTCaptcha(captchaAttributes);
        }
    }
}
