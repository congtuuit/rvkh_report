# ==========================
# 1️. Base runtime (for final image)
# ==========================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 7998
EXPOSE 7999

# ==========================
# 2️. Build frontend (React + Vite)
# ==========================
FROM node:20 AS frontend
WORKDIR /src/dashboard

# Copy package.json + lockfile trước để cache npm install
COPY dashboard/package*.json ./
RUN npm ci

# Copy toàn bộ source frontend
COPY dashboard/ ./
RUN npm run build

# ==========================
# 3️. Build backend (.NET 8)
# ==========================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy project file và restore trước (để tận dụng cache)
COPY ReviewKhoaHoc/ReviewKhoaHoc.csproj ./ReviewKhoaHoc/
RUN dotnet restore "ReviewKhoaHoc/ReviewKhoaHoc.csproj"

# Copy toàn bộ source backend
COPY ReviewKhoaHoc/ ./ReviewKhoaHoc/

# Copy frontend build output sang wwwroot
COPY --from=frontend /src/dashboard/dist ./ReviewKhoaHoc/wwwroot

# Build project
RUN dotnet build "ReviewKhoaHoc/ReviewKhoaHoc.csproj" -c $BUILD_CONFIGURATION -o /app/build

# ==========================
# 4️. Publish backend
# ==========================
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "ReviewKhoaHoc/ReviewKhoaHoc.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# ==========================
# 5️. Final runtime image
# ==========================
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ReviewKhoaHoc.dll"]
