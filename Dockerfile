FROM redhat/ubi9:latest

RUN dnf install -y aspnetcore-runtime-10.0

WORKDIR /app

COPY src/API/publish/ .

ENTRYPOINT ["dotnet", "API.dll"]
