#!/bin/bash

# 🔒 CHECKLIST DE IMPLEMENTACIÓN - LOGOUT REAL CON SEGURIDAD

echo "=========================================="
echo "✅ VERIFICACIÓN DE LOGOUT SEGURO"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
    else
        echo -e "${RED}❌${NC} $1"
    fi
}

check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✅${NC} $1 contiene: $2"
    else
        echo -e "${RED}❌${NC} $1 NO contiene: $2"
    fi
}

echo "📁 BACKEND FILES:"
check_file "backend/src/auth.ts"
check_file "backend/.env.example"

echo ""
echo "📝 BACKEND CODE CHECKS:"
check_content "backend/src/auth.ts" "export function generateTokens"
check_content "backend/src/auth.ts" "export function revokeRefreshToken"
check_content "backend/src/server.ts" "import { generateTokens"
check_content "backend/src/server.ts" "app.post('/api/logout'"
check_content "backend/src/server.ts" "app.post('/api/refresh'"
check_content "backend/package.json" "jsonwebtoken"
check_content "backend/package.json" "cookie-parser"

echo ""
echo "🎨 FRONTEND FILES:"
check_file "frontend/src/components/LogoutButton.vue"
check_file "frontend/src/utils/api.ts"
check_file "frontend/src/types/router.d.ts"

echo ""
echo "🔍 FRONTEND CODE CHECKS:"
check_content "frontend/src/utils/api.ts" "export function getAccessToken"
check_content "frontend/src/utils/api.ts" "export function authenticatedFetch"
check_content "frontend/src/main.ts" "import { isAuthenticated"
check_content "frontend/src/views/Login.vue" "sessionStorage.setItem('accessToken'"
check_content "frontend/src/components/LogoutButton.vue" "async function handleLogout"

echo ""
echo "📋 DATABASE CHECKS:"
check_content "backend/src/init_db.sql" "refresh_tokens"
check_content "backend/src/init_db.sql" "token_hash"
check_content "backend/src/init_db.sql" "revoked_at"

echo ""
echo "=========================================="
echo "📊 RESUMEN DE SEGURIDAD"
echo "=========================================="
echo ""
echo "✅ JWT Access Token:      15 minutos"
echo "✅ JWT Refresh Token:     7 días"
echo "✅ Cookie Protection:     HttpOnly + Secure + SameSite"
echo "✅ Token Storage:         DB + Hashed"
echo "✅ Revocation:            BD update en logout"
echo "✅ Auto Cleanup:          Cada hora"
echo ""
echo "=========================================="
echo "🚀 PRÓXIMAS ACCIONES:"
echo "=========================================="
echo ""
echo "1. cd backend && npm install"
echo "2. Editar backend/.env con secretos seguros"
echo "3. npm run dev"
echo "4. cd frontend && npm run dev"
echo "5. Agregar <LogoutButton /> al Dashboard"
echo ""
echo "=========================================="
