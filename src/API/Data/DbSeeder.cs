using Domain.Entities;
using Infrastructure.Persistence;

namespace API.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (context.Users.Any()) return;

        var admin = new User
        {
            FullName = "System Admin",
            Email = "admin@company.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            Role = "Admin",
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(admin);
        await context.SaveChangesAsync();
    }
}
