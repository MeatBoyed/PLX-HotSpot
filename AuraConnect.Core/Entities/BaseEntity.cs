using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Core.Entities
{
    public abstract class BaseEntity
    {
        public string Id { get; protected set; } = Guid.NewGuid().ToString("N");
        public DateTime CreatedAt { get; protected set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; protected set; } = DateTime.UtcNow;

        protected void UpdateTimestamp() => UpdatedAt = DateTime.UtcNow;
    }
}
