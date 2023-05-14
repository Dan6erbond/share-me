FROM jgpelaez/git-lfs AS deps

WORKDIR /tagger

RUN git clone https://huggingface.co/facebook/detr-resnet-50

WORKDIR /tagger/detr-resnet-50

RUN git lfs install
RUN git lfs pull

FROM python:3.10

WORKDIR /tagger

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .

ENV DETR_RESNET_50_MODEL_PATH=./detr-resnet-50
COPY --from=deps /tagger/detr-resnet-50 ./detr-resnet-50

RUN mkdir /tagger/torch
RUN mkdir /tagger/cache

ENV TORCH_HOME=/tagger/torch
ENV TRANSFORMERS_CACHE=/tagger/cache/huggingface/hub

EXPOSE 80

CMD ["gunicorn", "--conf", "gunicorn_conf.py", "--bind", "0.0.0.0:80", "app:app"]
