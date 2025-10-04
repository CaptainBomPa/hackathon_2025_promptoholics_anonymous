# 🚀 Deployment Guide - Pension Simulator

## Quick Start dla Hackathonu

### 1. Przygotowanie Raspberry Pi

```bash
# Aktualizacja systemu
sudo apt update && sudo apt upgrade -y

# Instalacja Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalacja Docker Compose
sudo apt install docker-compose -y

# Restart (żeby grupa docker zadziałała)
sudo reboot
```

### 2. Deployment Aplikacji

```bash
# Klonowanie repo
git clone <repository-url>
cd hackathon_2025_promptoholics_anonymous

# Deployment jedną komendą
./deploy.sh production
```

### 3. Dostęp do Aplikacji

- **Frontend**: http://raspberry-pi-ip:3000
- **Backend API**: http://raspberry-pi-ip:8080
- **Nginx Proxy**: http://raspberry-pi-ip:80 (w trybie production)

## 🔧 Konfiguracja

### Zmienne Środowiskowe

**Frontend (.env.production):**
```env
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_ENV=production
REACT_APP_USE_MOCK_DATA=false
REACT_APP_ENABLE_DEBUG=false
```

**Backend (application-production.yml):**
```yaml
server:
  port: 8080
logging:
  level:
    root: INFO
```

### Konfiguracja dla Różnych Środowisk

**Development (lokalne):**
```bash
./deploy.sh development
```

**Production (Raspberry Pi):**
```bash
./deploy.sh production
```

## 🐳 Docker Services

### Frontend Container
- **Image**: Node.js 18 Alpine + Nginx
- **Port**: 3000 (development) / 80 (production)
- **Features**: 
  - Multi-stage build
  - Gzip compression
  - Security headers
  - Health checks

### Backend Container
- **Image**: Java Spring Boot
- **Port**: 8080
- **Features**:
  - Production profile
  - Health checks
  - Data persistence

### Nginx Proxy (Production)
- **Port**: 80, 443
- **Features**:
  - Rate limiting
  - CORS handling
  - Load balancing
  - SSL ready

## 📊 Monitoring

### Health Checks
```bash
# Frontend health
curl http://localhost:3000/health

# Backend health
curl http://localhost:8080/actuator/health

# Nginx health
curl http://localhost:80/health
```

### Logs
```bash
# Wszystkie serwisy
docker-compose logs -f

# Konkretny serwis
docker-compose logs -f pension-frontend
docker-compose logs -f pension-api
```

### Status kontenerów
```bash
docker-compose ps
```

## 🔒 Security dla Hackathonu

### Minimalne Security (jak wymagane)
- CORS włączony dla wszystkich origins
- Rate limiting (30 req/s general, 10 req/s API)
- Basic security headers
- No authentication required

### Opcjonalne Wzmocnienie
```bash
# Firewall (opcjonalnie)
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## 🚨 Troubleshooting

### Problemy z Pamięcią (Raspberry Pi)
```bash
# Zwiększenie swap
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile  # CONF_SWAPSIZE=2048
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

### Problemy z Buildowaniem
```bash
# Czyszczenie Docker cache
docker system prune -a -f

# Rebuild bez cache
docker-compose build --no-cache
```

### Problemy z Siecią
```bash
# Restart Docker network
docker-compose down
docker network prune -f
docker-compose up -d
```

## 📈 Performance dla Pi

### Optymalizacje
- Multi-stage builds (mniejsze obrazy)
- Gzip compression
- Static asset caching
- Health checks z timeoutami
- Graceful shutdowns

### Monitoring Zasobów
```bash
# CPU i RAM
htop

# Docker stats
docker stats

# Disk usage
df -h
docker system df
```

## 🎯 Demo dla Sędziów

### Przygotowanie Demo
1. **Sprawdź wszystkie serwisy**: `docker-compose ps`
2. **Test frontend**: Otwórz http://pi-ip:3000
3. **Test API**: `curl http://pi-ip:8080/facts/random`
4. **Test kalkulacji**: Wypełnij formularz w UI

### Backup Plan
Jeśli API nie działa:
```bash
# Włącz mock data
echo "REACT_APP_USE_MOCK_DATA=true" >> front/.env.production
docker-compose restart pension-frontend
```

## 🔄 Updates

### Szybki Update
```bash
git pull
./deploy.sh production
```

### Update z czyszczeniem
```bash
docker-compose down
docker system prune -f
git pull
./deploy.sh production
```

---

**🎉 Gotowe do hackathonu!** 

Aplikacja powinna działać płynnie na Raspberry Pi z minimalnym security i maksymalną funkcjonalnością dla sędziów.