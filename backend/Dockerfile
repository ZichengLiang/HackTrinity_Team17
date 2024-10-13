# backend/Dockerfile

# Use the official Python image
FROM python:3.11

# Set the working directory
WORKDIR /app

# Copy requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Expose the FastAPI port (default is 8000)
EXPOSE 8000

# Command to run the FastAPI app
CMD ["uvicorn", "myapi:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
