import os
from http import HTTPStatus
from threading import Thread

import requests
import torch
from dotenv import load_dotenv
from flask import Flask
from PIL import Image
from pocketbase import PocketBase
from transformers import DetrForObjectDetection, DetrImageProcessor

load_dotenv()

app = Flask(__name__)

client = PocketBase(os.getenv("POCKETBASE_URL"))

model_name_or_path = os.getenv("DETR_RESNET_50_MODEL_PATH", "facebook/detr-resnet-50")
processor = DetrImageProcessor.from_pretrained(model_name_or_path)
model = DetrForObjectDetection.from_pretrained(model_name_or_path)


def get_auth_token(email, password):
    url = client.build_url(f"/api/admins/auth-with-password")

    req = requests.post(url, json={"identity": email, "password": password})

    return req.json()["token"]


def tag_file(file_id):
    print(f"Tagging {file_id}")

    try:
        record_url = client.build_url(f"/api/collections/files/records/{file_id}")

        req = requests.get(record_url)
        record = req.json()

        url = client.build_url(f"/api/files/files/{file_id}/{record['file']}")

        image = Image.open(requests.get(url, stream=True).raw)

        inputs = processor(images=image, return_tensors="pt")
        outputs = model(**inputs)

        # convert outputs (bounding boxes and class logits) to COCO API
        # let's only keep detections with score > 0.9
        target_sizes = torch.tensor([image.size[::-1]])
        results = processor.post_process_object_detection(
            outputs, target_sizes=target_sizes, threshold=0.9
        )[0]

        labels = {model.config.id2label[label.item()] for label in results["labels"]}

        token = get_auth_token(
            os.getenv("POCKETBASE_ADMIN_EMAIL"), os.getenv("POCKETBASE_ADMIN_PASSWORD")
        )

        req = requests.patch(
            record_url,
            json={"tagsSuggestions": list(labels)},
            headers={"Authorization": f"Bearer {token}"},
        )

        if req.status_code != HTTPStatus.OK:
            app.logger.warn(record_url, req.status_code, req.text)
    except BaseException as ex:
        app.logger.error(ex)


@app.route("/files/<file_id>", methods=["POST"])
def start_tag_file(file_id):
    thread = Thread(target=tag_file, args=(file_id,))
    thread.start()

    return {"file": file_id, "model": "facebook/detr-resnet-50"}, 202


if __name__ == "__main__":
    app.run()
