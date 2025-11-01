using CommentsApp.Data;
using CommentsApp.Services;
using DNTCaptcha.Core;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.EntityFrameworkCore;
namespace CommentsApp
    
{
    public class Program
    {
        public static void Main(string[] args)
        { 
            var builder = WebApplication.CreateBuilder(args);
            var encryptionKey = builder.Configuration["DNTCaptcha:EncryptionKey"]
                     ?? throw new InvalidOperationException("DNTCaptcha EncryptionKey not found.");
            builder.Services.AddControllers();
            builder.Services.AddOpenApi();
            builder.Services.AddScoped<ICommentRepository, CommentRepository>();
            builder.Services.AddSingleton<IHtmlSanitizerService, HtmlSanitizerService>();

            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                   options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
            builder.Services.AddDNTCaptcha(options =>
           options.UseCookieStorageProvider(Microsoft.AspNetCore.Http.SameSiteMode.Strict)
           .AbsoluteExpiration(minutes: 7) 
           .WithEncryptionKey(encryptionKey) 
           .ShowThousandsSeparators(false)
           .InputNames(
                new DNTCaptchaComponent 
                {
                    CaptchaHiddenInputName = "captchaHiddenText",
                    CaptchaHiddenTokenName = "captchaHiddenToken",
                    CaptchaInputName = "captchaInputText"
                })
           .Identifier("commentsCaptcha")
);
            var app = builder.Build();
       
            app.UseExceptionHandler(exceptionHandlerApp
                    => exceptionHandlerApp.Run(async context
                    => await Results.Problem().ExecuteAsync(context)));

            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();
            app.UseStaticFiles();
            /*
            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";

                if (app.Environment.IsDevelopment())
                {
                    spa.UseAngularCliServer(npmScript: "start");
                }
            });
            ApplyMigrations(app);
            */
            app.Run();
        }

        static void ApplyMigrations(IHost app)
        {
            using (var scope = app.Services.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                dbContext.Database.Migrate();
            }
        }
    }
}
