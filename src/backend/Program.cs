using CommentsApp.Data;
using CommentsApp.Services;
using DNTCaptcha.Core;
using Microsoft.EntityFrameworkCore;
namespace CommentsApp
    
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend",
                    builder => builder
                        .WithOrigins("http://localhost:4200",
                                     "http://13.62.20.52:4200")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials()); 
            });
            
            var encryptionKey = builder.Configuration["DNTCaptcha:EncryptionKey"]
                                 ?? throw new InvalidOperationException("DNTCaptcha EncryptionKey not found.");

            builder.Services.AddControllers();
            builder.Services.AddOpenApi();
            builder.Services.AddScoped<ICommentRepository, CommentRepository>();
            builder.Services.AddSingleton<IHtmlSanitizerService, HtmlSanitizerService>();
            
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

            builder.Services.AddDNTCaptcha(options =>
                   options.UseMemoryCacheStorageProvider()
                    .AbsoluteExpiration(minutes: 10)
                    .WithEncryptionKey(encryptionKey)
                    .ShowThousandsSeparators(false)
                    .InputNames(
                        new DNTCaptchaComponent
                        {
                            CaptchaHiddenInputName = "DNTCaptchaText",
                            CaptchaHiddenTokenName = "DNTCaptchaToken",
                            CaptchaInputName = "DNTCaptchaInputText"
                        })
                    .Identifier("commentsCaptcha"));
            builder.Services.AddSingleton<FIleService>();

            var app = builder.Build();

            app.UseExceptionHandler(exceptionHandlerApp
                => exceptionHandlerApp.Run(async context
                    => await Results.Problem().ExecuteAsync(context)));

            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseCors("AllowFrontend");
            app.UseAuthorization();
            app.MapControllers();
            app.UseStaticFiles();
            ApplyMigrations(app);
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
