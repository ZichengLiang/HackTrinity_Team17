import os
import requests
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from dotenv import load_dotenv

load_dotenv()

PERPLEX_URL = os.getenv("PERPLEX_URL")
PERPLEX_API_KEY = os.getenv("PERPLEX_API_KEY")


tokenizer = AutoTokenizer.from_pretrained("nlpaueb/legal-bert-base-uncased")
model = AutoModelForSequenceClassification.from_pretrained("nlpaueb/legal-bert-base-uncased")

def process_query(query_text: str):
    if not query_text:
        raise ValueError("Query text cannot be empty")

    # Tokenize the input query for Legal-BERT (if needed for processing)
    inputs = tokenizer(query_text, return_tensors="pt", truncation=True, max_length=512)
    legal_bert_output = model(**inputs)

    # You can still use the logits if you need to process them, but 
    # we will focus on using the conversational AI for generating a response.

    # Prepare the input for the conversational AI
    try:
        response = requests.post(
            PERPLEX_URL,
            headers={
                "Authorization": f"Bearer {PERPLEX_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.1-sonar-large-128k-chat",
                "messages": [
                    {"role": "user", "content": f"I need some general guidance on legal matters related to {query_text}."}
                ],
                "max_tokens": 150,
                "temperature": 0.7
            }

        )
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        raise RuntimeError(f"Error querying Perplexity API: {str(e)}")

    # Retrieve and return the bot's response
    perplexity_result = response.json()
    if "choices" not in perplexity_result or not perplexity_result["choices"]:
        raise RuntimeError("Invalid response from Perplexity API.")

    perplexity_text = perplexity_result["choices"][0]["message"]["content"]

    return {
        "perplexity_response": perplexity_text  # Focus on the response from the conversational model
    }
