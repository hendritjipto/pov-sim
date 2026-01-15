# Use the official Python 3.8 image as the base image
FROM python:3.8-slim-buster

# Set the working directory inside the container
WORKDIR /python-docker

# Copy the requirements file into the container
COPY requirements.txt requirements.txt

# Install the required dependencies
RUN pip3 install -r requirements.txt

# Install OpenTelemetry auto-instrumentation
RUN opentelemetry-bootstrap -a install

# Copy the rest of your application code into the container
COPY . .

# Set OpenTelemetry environment variables
ENV OTEL_RESOURCE_ATTRIBUTES="service.name=flights,service.namespace=pov-sim,deployment.environment=production"
ENV OTEL_EXPORTER_OTLP_ENDPOINT="http://alloy:4317"
ENV OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED="true"
ENV OTEL_PYTHON_LOG_CORRELATION="true"
ENV OTEL_TRACES_EXPORTER="otlp"
ENV OTEL_METRICS_EXPORTER="otlp"
ENV OTEL_LOGS_EXPORTER="otlp"

# Expose port 5001
EXPOSE 5001

# Specify the command to run your Flask app with Gunicorn and OpenTelemetry auto-instrumentation
# Note: No --access-logfile flag - using @app.after_request for trace-correlated logging instead
CMD ["opentelemetry-instrument", "gunicorn", "--bind", "0.0.0.0:5001", "--workers", "2", "app:app"]
