using AuraConnect.Core.Entities;
using Microsoft.AspNetCore.Identity;

namespace AuraConnect.Infrastructure.Identity
{
    public class ApplicationUser : IdentityUser
    {
        public virtual Profile? Profile { get; set; }
    }
}
