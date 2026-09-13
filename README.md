# Teamora Frontend

## Chạy bằng Docker

Khởi động backend trước, sau đó:

```bash
docker compose up --build -d
docker compose ps
```

Web chạy tại <http://localhost:3000>. Trên Docker Desktop, container mặc định gọi
backend qua `http://host.docker.internal:8080`.

Nếu backend ở máy hoặc hostname khác:

```bash
TEAMORA_DOCKER_API_URL=http://192.168.1.10:8080 docker compose up --build -d
```

`TEAMORA_DOCKER_API_URL` chỉ dùng để cấu hình container; nó không thay đổi contract
`TEAMORA_API_URL` của ứng dụng. Production không dùng file này; xem repository
`teamora-deployment`.
