using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
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
    public async Task<IActionResult> Create([FromBody] Employee employee)
    {
        employee.CreatedAt = DateTime.UtcNow;
        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = employee.Id }, employee);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Employee updated)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null) return NotFound();

        employee.FullName = updated.FullName;
        employee.Email = updated.Email;
        employee.Department = updated.Department;
        employee.Position = updated.Position;
        employee.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(employee);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Disable(int id)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null) return NotFound();

        employee.IsActive = false;
        employee.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Employee disabled successfully" });
    }
}
