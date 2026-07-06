namespace AuraConnect.Application.DTOs.MikroTik
{
    public class MikroTikPoolInfo
    {
        public string Name { get; init; } = string.Empty;
        public string? Ranges { get; init; }
        public int? Total { get; init; }
        public int? Used { get; init; }
        public int? Available { get; init; }
    }
}
