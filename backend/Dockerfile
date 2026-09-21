# Cloud Run injects $PORT and expects the container to listen on it, so the
# CMD binds to 0.0.0.0:$PORT rather than a hardcoded port.
FROM python:3.11-slim

WORKDIR /app

# Install dependencies first so Docker can cache this layer across builds
# that only change application code, not requirements.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Cloud Run sets PORT at runtime; 8080 is its default and works for local
# `docker run` without extra flags too.
ENV PORT=8080
EXPOSE 8080

CMD exec uvicorn main:app --host 0.0.0.0 --port ${PORT}
