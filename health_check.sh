#!/bin/sh
# 检查 Nginx
if ! curl -f http://localhost/health >/dev/null 2>&1; then
    echo "Nginx health check failed"
    exit 1
fi

# 检查后端API
if ! curl -f http://localhost:3001/api/health >/dev/null 2>&1; then
    echo "Backend API health check failed"
    exit 1
fi

echo "All services healthy"
exit 0 