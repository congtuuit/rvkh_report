# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# ------------------------------
# 1️. Base runtime (for final image)
# ------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 7998
EXPOSE 7999

# ------------------------------
# 2️. Build frontend (React + Vite)
# ------------------------------
FROM node:20 AS frontend
WORKDIR /src/dashboard
COPY ../dashboard/package*.json ./
RUN npm install
COPY ../dashboard/ .
RUN npm run build

# ------------------------------
# 3️. Build backend (.NET 8)
# ------------------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["ReviewKhoaHoc.csproj", "."]
RUN dotnet restore "./ReviewKhoaHoc.csproj"
COPY . .
# Copy frontend build to wwwroot
COPY --from=frontend /src/dashboard/dist ./wwwroot
RUN dotnet build "./ReviewKhoaHoc.csproj" -c $BUILD_CONFIGURATION -o /app/build

# ------------------------------
# 4️. Publish backend
# ------------------------------
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./ReviewKhoaHoc.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# ------------------------------
# 5️. Final runtime image
# ------------------------------
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ReviewKhoaHoc.dll"]
