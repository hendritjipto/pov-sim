from flasgger import Swagger
from flask import Flask, jsonify, request
from flask_cors import CORS
from utils import get_random_int
import pyroscope
import os

import logging

pyroscope.configure(
    application_name="flights",
    server_address=os.environ.get("PYROSCOPE_SERVER_ADDRESS", "http://alloy:4040"),
    tags={
        "service": "flights",
        "namespace": "pov-sim",
        "environment": os.environ.get("DEPLOYMENT_ENV", "production"),
    }
)


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logging.getLogger('werkzeug').setLevel(logging.WARNING)

app = Flask(__name__)
Swagger(app)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    """Health endpoint
    ---
    responses:
      200:
        description: Returns healthy
    """
    return jsonify({"status": "healthy"}), 200

@app.route("/", methods=['GET'])
def home():
    """No-op home endpoint
    ---
    responses:
      200:
        description: Returns ok
    """
    return jsonify({"message": "ok"}), 200

@app.route("/flights/<airline>", methods=["GET"])
def get_flights(airline):

    """Get flights endpoint. Optionally, set raise to trigger an exception.
    ---
    parameters:
      - name: airline
        in: path
        type: string
        enum: ["AA", "UA", "DL"]
        required: true
      - name: raise
        in: query
        type: str
        enum: ["500"]
        required: false
    responses:
      200:
        description: Returns a list of flights for the selected airline
    """
    status_code = request.args.get("raise")
    if status_code:
      raise Exception(f"Encountered {status_code} error") # pylint: disable=broad-exception-raised
    random_int = get_random_int(100, 999)
    return jsonify({airline: [random_int]}), 200

@app.route("/flight", methods=["POST"])
def book_flight():
    """Book flights endpoint. Optionally, set raise to trigger an exception.
    ---
    parameters:
      - name: passenger_name
        in: query
        type: string
        enum: ["John Doe", "Jane Doe"]
        required: true
      - name: flight_num
        in: query
        type: string
        enum: ["101", "202", "303", "404", "505", "606"]
        required: true
      - name: raise
        in: query
        type: str
        enum: ["500"]
        required: false
    responses:
      200:
        description: Booked a flight for the selected passenger and flight_num
    """
    status_code = request.args.get("raise")
    if status_code:
      raise Exception(f"Encountered {status_code} error") # pylint: disable=broad-exception-raised
    passenger_name = request.args.get("passenger_name")
    flight_num = request.args.get("flight_num")
    booking_id = get_random_int(100, 999)
    return jsonify({"passenger_name": passenger_name, "flight_num": flight_num, "booking_id": booking_id}), 200

@app.after_request
def log_response(response):
    """Log requests within the span context for trace correlation."""
    log_message = (
        f"{request.method} {request.path} | "
        f"Status: {response.status_code} | "
        f"Args: {dict(request.args)} | "
        f"Remote: {request.remote_addr}"
    )
    extra = {}
    # Add request-specific metadata
    if request.view_args:
        if 'airline' in request.view_args:
            extra['airline.code'] = request.view_args['airline']
    
    # Add query parameters as metadata
    if request.args:
        if request.args.get('passenger_name'):
            extra['booking.passenger'] = request.args.get('passenger_name')
        if request.args.get('flight_num'):
            extra['booking.flight_num'] = request.args.get('flight_num')
        
    # Use appropriate log level based on status code
    if response.status_code >= 500:
        logger.error(log_message, extra=extra)
    elif response.status_code >= 400:
        logger.warning(log_message, extra=extra)
    else:
        logger.info(log_message, extra=extra)
    
    return response

if __name__ == "__main__":
    app.run(debug=True, port=5001)
