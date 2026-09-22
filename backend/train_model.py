import pandas as pd
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

def main():
    print("Loading dataset...")
    df = pd.read_csv('../csic_database.csv')
    
    # Check dataset structure
    # The classification column is 0 for Normal, 1 for Anomalous
    # We will combine URL and content (payload) as our text feature
    print("Preprocessing data...")
    df['URL'] = df['URL'].fillna('')
    df['content'] = df['content'].fillna('')
    df['Method'] = df['Method'].fillna('')
    
    # Combine relevant features into a single string for TF-IDF
    df['combined_text'] = df['Method'] + " " + df['URL'] + " " + df['content']
    
    X = df['combined_text']
    y = df['classification']
    
    # Strict Train/Test split to avoid data leakage
    print("Splitting dataset...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("Vectorizing text features...")
    vectorizer = TfidfVectorizer(max_features=5000)
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    
    print("Training Random Forest model...")
    model = RandomForestClassifier(n_estimators=50, random_state=42, n_jobs=-1)
    model.fit(X_train_vec, y_train)
    
    print("Evaluating model...")
    y_pred = model.predict(X_test_vec)
    print("Accuracy:", accuracy_score(y_test, y_pred))
    print("Classification Report:\n", classification_report(y_test, y_pred))
    
    print("Saving model and vectorizer...")
    os.makedirs('models', exist_ok=True)
    with open('models/vectorizer.pkl', 'wb') as f:
        pickle.dump(vectorizer, f)
    with open('models/model.pkl', 'wb') as f:
        pickle.dump(model, f)
        
    print("Training complete. Artifacts saved in backend/models/")

if __name__ == '__main__':
    main()
