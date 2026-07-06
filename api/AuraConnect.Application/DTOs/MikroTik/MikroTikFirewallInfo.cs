namespace AuraConnect.Application.DTOs.MikroTik
{
    public class MikroTikFirewallInfo
    {
        public string ExpectedList { get; init; } = string.Empty;
        public bool IsListed { get; init; }
        public IReadOnlyList<MikroTikFirewallEntry> MatchingEntries { get; init; } = [];
    }
}
