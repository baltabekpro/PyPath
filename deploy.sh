#!/bin/bash
set -e

# PyPath Production Deploy Script
echo "🚀 Starting PyPath deployment..."

PROJECT_NAME="pypath"
DEPLOY_DIR="/home/baltabek/$PROJECT_NAME"
BACKEND_PORT=8080

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create project directory
echo -e "${YELLOW}📁 Creating project directory...${NC}"
mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR

# Copy files from local (will be uploaded via scp/rsync)
echo -e "${YELLOW}📦 Project files should be uploaded to $DEPLOY_DIR${NC}"

# Install Python dependencies
echo -e "${YELLOW}📚 Installing Python dependencies...${NC}"
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Copy production env
cp .env.production .env

# Setup database
echo -e "${YELLOW}🗄️ Setting up database...${NC}"
# Run migrations if alembic is setup
# alembic upgrade head

# Build frontend
echo -e "${YELLOW}⚡ Building frontend...${NC}"
cd ../
npm install
npm run build

# Create systemd service for backend
echo -e "${YELLOW}⚙️ Creating systemd service...${NC}"
sudo tee /etc/systemd/system/pypath-backend.service > /dev/null <<EOF
[Unit]
Description=PyPath FastAPI Backend
After=network.target

[Service]
Type=simple
User=baltabek
WorkingDirectory=$DEPLOY_DIR/backend
Environment="PATH=$DEPLOY_DIR/backend/venv/bin"
ExecStart=$DEPLOY_DIR/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port $BACKEND_PORT
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start service
sudo systemctl daemon-reload
sudo systemctl enable pypath-backend
sudo systemctl restart pypath-backend

# Configure nginx
echo -e "${YELLOW}🌐 Configuring nginx...${NC}"
sudo tee /etc/nginx/sites-available/pypath > /dev/null <<'EOF'
server {
    listen 80;
    server_name 94.131.85.176;
    
    # Frontend static files
    location / {
        root /home/baltabek/pypath/dist;
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Backend auth routes
    location /auth/ {
        proxy_pass http://localhost:8080/auth/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Backend direct endpoints
    location ~ ^/(courses|missions|achievements|leaderboard|posts|currentUser|friends|uiData|health) {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable nginx site
sudo ln -sf /etc/nginx/sites-available/pypath /etc/nginx/sites-enabled/pypath
sudo nginx -t
sudo systemctl reload nginx

# Show status
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🔗 Frontend: http://94.131.85.176${NC}"
echo -e "${GREEN}🔗 Backend: http://94.131.85.176:8080${NC}"
echo -e "${YELLOW}📊 Check backend status: sudo systemctl status pypath-backend${NC}"
echo -e "${YELLOW}📝 Backend logs: sudo journalctl -u pypath-backend -f${NC}"
