# 使用官方的 Nginx apline 精简版镜像作为基础
FROM nginx:alpine

# 将当前目录下的所有文件复制到 Nginx 的默认网站托管目录
# 这会将 index.html, style.css, 和 script.js 添加到镜像中
COPY . /usr/share/nginx/html

# 声明容器在运行时监听 80 端口
EXPOSE 80

# Nginx 镜像会默认运行 nginx -g 'daemon off;'，所以我们不需要指定 CMD 