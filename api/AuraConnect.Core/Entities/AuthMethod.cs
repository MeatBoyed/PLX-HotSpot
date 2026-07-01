namespace AuraConnect.Core.Entities
{
    public static class AuthMethod
    {
        public const string Free = "free";
        public const string Voucher = "voucher";
        public const string EmailPassword = "email-password";
        public const string NamePhone = "name-phone";

        public static readonly IReadOnlySet<string> All = new HashSet<string>
        {
            Free, Voucher, EmailPassword, NamePhone
        };
    }
}
