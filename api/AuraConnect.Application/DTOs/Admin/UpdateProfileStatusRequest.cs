namespace AuraConnect.Application.DTOs.Admin
{
    public class UpdateProfileStatusRequest
    {
        /// <summary>Active or Suspended</summary>
        public string Status { get; init; } = string.Empty;
    }
}
