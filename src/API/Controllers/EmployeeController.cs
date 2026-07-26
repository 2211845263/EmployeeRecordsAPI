using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmployeeController : ControllerBase
{
    private readonly AppDbContext _context;

    public EmployeeController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var employees = await _context.Employees.Where(e => e.IsActive).ToListAsync();
        return Ok(employees);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null) return NotFound();
        return Ok(employee);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] Employee employee)
    {
        employee.CreatedAt = DateTime.UtcNow;
        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        await WriteAuditLog("Employee", "Create", null, employee);

        return CreatedAtAction(nameof(GetById), new { id = employee.Id }, employee);
    }


    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] Employee updated)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null) return NotFound();

        var oldValues = JsonSerializer.Serialize(employee);

        employee.FullName = updated.FullName;
        employee.Email = updated.Email;
        employee.Department = updated.Department;
        employee.Position = updated.Position;
        employee.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await WriteAuditLog("Employee", "Update", oldValues, employee);

        return Ok(employee);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Disable(int id)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null) return NotFound();

        var oldValues = JsonSerializer.Serialize(employee);

        employee.IsActive = false;
        employee.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await WriteAuditLog("Employee", "Disable", oldValues, employee);

        return Ok(new { message = "Employee disabled successfully" });
    }

    private async Task WriteAuditLog(string entityName, string action, string? oldValues, object newValues)
    {
        var performedBy = User.FindFirstValue(ClaimTypes.Email) ?? "Unknown";

        var auditLog = new AuditLog
        {
            EntityName = entityName,
            Action = action,
            PerformedBy = performedBy,
            PerformedAt = DateTime.UtcNow,
            OldValues = oldValues,
            NewValues = JsonSerializer.Serialize(newValues)
        };

        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync();
    }
}
