using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    [HttpGet("dashboard")]
    public IActionResult GetDashboard()
    {
        return Ok(new
        {
            Message = "Welcome to the admin dashboard. This endpoint requires the Admin role.",
            Timestamp = DateTime.UtcNow
        });
    }
}
