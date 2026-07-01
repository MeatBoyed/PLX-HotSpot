using AuraConnect.Application.DTOs.Wallet;

namespace AuraConnect.Application.Interfaces
{
    public interface IPayFastService
    {
        Task<(string Action, Dictionary<string, string> Fields)> CreatePaymentFormAsync(
            decimal amount, string itemName, string reference,
            string? notifyUrl, string? returnUrl, string? cancelUrl,
            string? buyerFirstName = null, string? buyerLastName = null, string? buyerEmail = null,
            string? customStr1 = null, string? customStr2 = null,
            CancellationToken cancellationToken = default);
        Task<bool> VerifyIpnAsync(Dictionary<string, string> ipnData, CancellationToken cancellationToken = default);
    }
}
