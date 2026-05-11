namespace AuraConnect.Application.Interfaces
{
    public interface IPayFastService
    {
        Task<string> CreatePaymentUrlAsync(decimal amount, string itemName, string reference, string notifyUrl, string returnUrl, string cancelUrl);
        bool VerifyIpn(Dictionary<string, string> ipnData);
    }
}
