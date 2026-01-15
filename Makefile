up:
	docker compose up --build

down:
	docker compose down

rebuild:
	docker compose build --no-cache
	docker compose up

rebuild-frontend:
	docker compose build --no-cache frontend
	docker compose up

.PHONY: up down rebuild rebuild-frontend
