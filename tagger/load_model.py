import os

from transformers import DetrForObjectDetection, DetrImageProcessor

model_name_or_path = os.getenv("DETR_RESNET_50_MODEL_PATH", "facebook/detr-resnet-50")
processor = DetrImageProcessor.from_pretrained(model_name_or_path)
model = DetrForObjectDetection.from_pretrained(model_name_or_path)

print(f"Loaded model {model.name_or_path}")
