using AuraConnect.Application.DTOs.Wallet;

namespace AuraConnect.Application.Interfaces
{
    public interface IPayFastService
    {
        Task<(string Action, Dictionary<string, string> Fields)> CreatePaymentFormAsync(decimal amount, string itemName, string reference, string? notifyUrl, string? returnUrl, string? cancelUrl, CancellationToken cancellationToken = default);
        Task<bool> VerifyIpnAsync(Dictionary<string, string> ipnData, CancellationToken cancellationToken = default);
    }
}
