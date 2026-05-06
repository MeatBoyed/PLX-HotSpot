FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY AuraConnect.slnx .
COPY AuraConnect.Core/AuraConnect.Core.csproj AuraConnect.Core/
COPY AuraConnect.Application/AuraConnect.Application.csproj AuraConnect.Application/
COPY AuraConnect.Infrastructure/AuraConnect.Infrastructure.csproj AuraConnect.Infrastructure/
COPY AuraConnectAPI/AuraConnect.API.csproj AuraConnectAPI/

RUN dotnet restore AuraConnect.slnx

COPY . .

RUN dotnet publish AuraConnectAPI/AuraConnect.API.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "AuraConnect.API.dll"]
