namespace AuraConnect.Application.DTOs.MikroTik
{
    public class MikroTikFirewallEntry
    {
        public string List { get; init; } = string.Empty;
        public string Address { get; init; } = string.Empty;
        public DateTime? CreationTime { get; init; }
    }
}
