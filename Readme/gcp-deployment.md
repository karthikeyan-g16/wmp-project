## Steps
---

**Set project** 
````text
gcloud config set project PROJECT_ID

gcloud services enable container.googleapis.com compute.googleapis.com \
  dns.googleapis.com sqladmin.googleapis.com servicenetworking.googleapis.com \
  secretmanager.googleapis.com artifactregistry.googleapis.com
````
**Service account Json keys generation** 
````
gcloud iam service-accounts create my-service-account \
    --description="Service account for GKE management" \
    --display-name="Admin SA"

gcloud iam service-accounts keys create ./my-sa-key.json \
    --iam-account=my-service-account@${PROJECT_ID}.iam.gserviceaccount.com

 gcloud projects add-iam-policy-binding ${PROJECT_ID}     --member="serviceAccount:my-service-account@${PROJECT_ID}.iam.gserviceaccount.com"     --role="roles/owner"

gcloud auth activate-service-account --key-file=/home/unix/my-sa-key.json

 export GOOGLE_APPLICATION_CREDENTIALS="/home/unix/my-sa-key.json"
````

gcloud config set project YOUR_PROJECT_ID



